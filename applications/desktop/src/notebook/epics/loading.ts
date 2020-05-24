import * as path from "path";

import {
  ImmutableNotebook,
  monocellNotebook,
  toJS
} from "@nteract/commutable";
import { actions, AppState, selectors } from "@nteract/core";
import { ofType, StateObservable } from "redux-observable";
import { empty, Observable, of } from "rxjs";
import {
  map,
  mergeMap
} from "rxjs/operators";

const notebookMediaType = "application/x-ipynb+json";

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

export const launchKernelWhenNotebookSetEpic = (
  action$: Observable<actions.FetchContentFulfilled>,
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
  action$: Observable<actions.NewNotebook>
) =>
  action$.pipe(
    ofType(actions.NEW_NOTEBOOK),
    map((action: actions.NewNotebook) => {
      const {
        payload: {
          kernelSpec: { name, spec }
        }
      } = action;

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
        (action.payload.filepath !== null &&
          path.resolve(action.payload.filepath)) ||
        path.join(action.payload.cwd, "Untitled.ipynb");

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
        contentRef: action.payload.contentRef
      });
    })
  );
