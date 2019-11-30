import { KernelspecInfo, KernelspecMetadata } from "@nteract/types";
import * as fs from "fs";
import * as path from "path";

import {
  ImmutableNotebook,
  monocellNotebook,
  Notebook,
  toJS
} from "@nteract/commutable";
import { actions, AppState, selectors } from "@nteract/core";
import { readFileObservable, statObservable } from "fs-observable";
import { AnyAction } from "redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { combineLatest, empty, forkJoin, of } from "rxjs";
import {
  catchError,
  map,
  mergeMap,
  switchMap, take,
  tap,
  timeout
} from "rxjs/operators";

const notebookMediaType = "application/x-ipynb+json";

import { contents } from "rx-jupyter";

/**
 * Determines the right kernel to launch based on a notebook
 */
export const extractNewKernel = (
  filepath: string | null,
  notebook: ImmutableNotebook
) => {
  // NOTE: There's some incongruence between desktop and web app here, regarding path vs. filename
  //       Instead, this function is slightly repeated between here and @nteract/core
  const cwd =
    (filepath !== null && path.dirname(path.resolve(filepath))) ||
    process.cwd();
  const kernelSpecName =
    notebook.getIn(["metadata", "kernelspec", "name"]) ||
    notebook.getIn(["metadata", "language_info", "name"]) ||
    "python3";
  return {
    cwd,
    kernelSpecName
  };
};

function createContentsResponse(
  filePath: string,
  stat: fs.Stats,
  content: Buffer
): contents.IContent<"notebook"> {
  const parsedFilePath = path.parse(filePath);

  const name = parsedFilePath.base;
  // tslint:disable-next-line no-bitwise
  const writable = Boolean(fs.constants.W_OK & stat.mode);
  const created = stat.birthtime.toString();
  // tslint:disable-next-line variable-name -- jupyter camel case naming convention for API
  const last_modified = stat.mtime.toString();

  if (stat.isDirectory()) {
    throw new Error("Attempted to open a directory instead of a notebook");
  } else if (stat.isFile()) {
    if (parsedFilePath.ext === ".ipynb") {
      return {
        type: "notebook",
        mimetype: notebookMediaType,
        format: "json",
        content: content ? JSON.parse(content.toString()) : null,
        writable,
        name,
        path: filePath,
        created,
        last_modified
      };
    }
    throw new Error("File does not end in ipynb and will not be opened");
  }

  throw new Error(`Unsupported filetype at ${filePath}`);
}

/**
 * Loads a notebook and launches its kernel.
 *
 * @param  {ActionObservable}  A LOAD action with the notebook filename
 */
export const fetchContentEpic = (
  action$: ActionsObservable<actions.FetchContent>
) =>
  action$.pipe(
    ofType(actions.FETCH_CONTENT),
    tap((action: actions.FetchContent) => {
      // If there isn't a filepath, save-as it instead
      if (!action.payload.filepath) {
        throw new Error("fetch content needs a path");
      }
    }),
    // Switch map since we want the last load request to be the lead
    switchMap(action => {
      const filepath = action.payload.filepath;

      return forkJoin(
        readFileObservable(filepath),
        statObservable(filepath),
        // Project onto the Contents API response
        (content: Buffer, stat: fs.Stats): contents.IContent =>
          createContentsResponse(filepath, stat, content)
      ).pipe(
        // Timeout after one minute
        timeout(60 * 1000),
        map((model: contents.IContent<"notebook">) => {
          if (model.type !== "notebook") {
            throw new Error(
              "Attempted to load a non-notebook type from desktop"
            );
          }
          if (model.content === null) {
            throw new Error("No content loaded for notebook");
          }

          return actions.fetchContentFulfilled({
            filepath: model.path,
            model,
            kernelRef: action.payload.kernelRef,
            contentRef: action.payload.contentRef
          });
        }),
        catchError((err: Error) =>
          of(
            actions.fetchContentFailed({
              filepath,
              error: err,
              kernelRef: action.payload.kernelRef,
              contentRef: action.payload.contentRef
            })
          )
        )
      );
    })
  );

export const launchKernelWhenNotebookSetEpic = (
  action$: ActionsObservable<actions.FetchContentFulfilled>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.FETCH_CONTENT_FULFILLED),
    mergeMap((action: actions.FetchContentFulfilled) => {
      const contentRef = action.payload.contentRef;

      const content = selectors.content(state$.value, { contentRef });

      if (
        !content ||
        content.type !== "notebook" ||
        content.model.type !== "notebook"
      ) {
        // This epic only handles notebook content
        return empty();
      }

      const filepath = content.filepath;
      const notebook = content.model.notebook;

      const { cwd, kernelSpecName } = extractNewKernel(filepath, notebook);

      return of(
        actions.launchKernelByName({
          kernelSpecName,
          cwd,
          kernelRef: action.payload.kernelRef,
          selectNextKernel: true,
          contentRef: action.payload.contentRef
        })
      );
    })
  );

/**
 * Sets a new empty notebook.
 *
 * @param  {ActionObservable}  ActionObservable for NEW_NOTEBOOK action
 */
export const newNotebookEpic = (
  action$: ActionsObservable<AnyAction>,
  state$: StateObservable<AppState>,
) =>
  combineLatest(
    action$.ofType("MERGE_CONFIG_DONE").pipe(take(1)),
    action$.ofType(actions.NEW_NOTEBOOK),
  ).pipe(
    map(([_, action]) => action as actions.NewNotebook),
    map((action: actions.NewNotebook) => {
      let name: string;
      let spec: KernelspecMetadata | undefined;

      if (action.payload.kernelSpec !== null) {
        name = action.payload.kernelSpec.name;
        spec = action.payload.kernelSpec.spec;
      }
      else {
        name = state$.value.config.get("initialKernel");
      }

      // TODO: work on a raw javascript object since we convert it over again
      let notebook = monocellNotebook;
      if (name) {
        notebook = notebook
          .setIn(["metadata", "kernel_info", "name"], name)
          .setIn(["metadata", "language_info", "name"], name);
      }
      if (spec) {
        notebook = notebook
          .setIn(["metadata", "kernelspec"], spec)
          .setIn(["metadata", "kernelspec", "name"], name);
      }

      const timestamp = new Date();
      const filepath =
        (
          action.payload.filepath !== null &&
          path.resolve(action.payload.filepath)
        ) || path.join(action.payload.cwd, "Untitled.ipynb");

      return actions.fetchContentFulfilled({
        filepath,
        model: {
          type: "notebook",
          mimetype: notebookMediaType,
          format: "json",
          // Back to JS, only to immutableify it inside of the reducer
          content: toJS(notebook),
          writable: true,
          name: path.basename(filepath),
          path: filepath,
          created: timestamp.toString(),
          last_modified: timestamp.toString()
        },
        kernelRef: action.payload.kernelRef,
        contentRef: action.payload.contentRef,
      });
    })
  );
