import * as actions from "@nteract/actions";
import { Notebook, stringifyNotebook, toJS } from "@nteract/commutable";
import { sendNotification } from "@nteract/mythic-notifications";
import * as selectors from "@nteract/selectors";
import {
  AppState,
  ContentRef,
  createKernelRef,
  DirectoryContentRecordProps,
  DummyContentRecordProps,
  FileContentRecordProps,
  IContent,
  IContentProvider,
  JupyterHostRecord,
  NotebookContentRecordProps,
  ServerConfig
} from "@nteract/types";
import FileSaver from "file-saver";
import { RecordOf } from "immutable";
import * as path from "path";
import { Action } from "redux";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { EMPTY, from, interval, Observable, of } from "rxjs";
import { AjaxResponse } from "rxjs/ajax";
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  switchMap,
  take,
  tap
} from "rxjs/operators";
import urljoin from "url-join";

export function updateContentEpic(
  action$: ActionsObservable<actions.ChangeContentName>,
  state$: StateObservable<AppState>,
  dependencies: { contentProvider: IContentProvider }
): Observable<unknown> {
  return action$.pipe(
    ofType(actions.CHANGE_CONTENT_NAME),
    switchMap(action => {
      const state = state$.value;
      const { filepath, prevFilePath } = action.payload;

      const host = selectors.currentHost(state) as JupyterHostRecord;
      const serverConfig: ServerConfig = selectors.serverConfig(host);

      return dependencies.contentProvider
        .update(serverConfig, prevFilePath, { path: filepath.slice(1) })
        .pipe(
          tap(xhr => {
            if (xhr.status !== 200) {
              throw new Error(xhr.response);
            }
          }),
          map(() => {
            /*
             * Modifying the url's file name in the browser.
             * This effects back button behavior.
             * Is there a better way to accomplish this?
             */
            window.history.replaceState(
              {},
              filepath,
              urljoin(host.basePath, `/nteract/edit${filepath}`)
            );

            return actions.changeContentNameFulfilled({
              contentRef: action.payload.contentRef,
              filepath: action.payload.filepath,
              prevFilePath
            });
          }),
          catchError((xhrError: any) =>
            of(
              actions.changeContentNameFailed({
                basepath: host.basePath,
                filepath: action.payload.filepath,
                prevFilePath,
                error: xhrError,
                contentRef: action.payload.contentRef
              })
            )
          )
        );
    })
  );
}

export function fetchContentEpic(
  action$: ActionsObservable<
    | actions.FetchContent
    | actions.FetchContentFailed
    | actions.FetchContentFulfilled
  >,
  state$: StateObservable<AppState>,
  dependencies: { contentProvider: IContentProvider }
): Observable<unknown> {
  return action$.pipe(
    ofType(actions.FETCH_CONTENT),
    switchMap(action => {
      const state = state$.value;
      const host = selectors.currentHost(state) as JupyterHostRecord;
      const serverConfig: ServerConfig = selectors.serverConfig(host);

      return dependencies.contentProvider
        .get(
          serverConfig,
          (action as actions.FetchContent).payload.filepath,
          (action as actions.FetchContent).payload.params
        )
        .pipe(
          tap(xhr => {
            if (xhr.status !== 200) {
              throw new Error(xhr.response.toString());
            }
          }),
          map(xhr => {
            if (typeof xhr.response === "string") {
              throw new Error(`Invalid API response: ${xhr.response}`);
            }

            return actions.fetchContentFulfilled({
              filepath: action.payload.filepath,
              model: xhr.response,
              kernelRef: action.payload.kernelRef,
              contentRef: action.payload.contentRef
            });
          }),
          catchError((xhrError: any) =>
            of(
              actions.fetchContentFailed({
                filepath: action.payload.filepath,
                error: xhrError,
                kernelRef: action.payload.kernelRef,
                contentRef: action.payload.contentRef
              })
            )
          )
        );
    })
  );
}

export function downloadString(
  fileContents: string,
  filepath: string,
  contentType: string
): void {
  const filename = filepath.split("/").pop();
  const blob = new Blob([fileContents], { type: contentType });
  // NOTE: There is no callback for this, we have to rely on the browser
  //       to do this well, so we assume it worked
  FileSaver.saveAs(blob, filename);
}

export function autoSaveCurrentContentEpic(
  action$: ActionsObservable<Action>,
  state$: StateObservable<AppState>
): Observable<actions.Save> {
  return state$.pipe(
    map(state => selectors.autoSaveInterval(state)),
    switchMap(time => interval(time)),
    mergeMap(() => {
      const state = state$.value;
      return from(
        selectors
          .contentByRef(state)
          .filter(
            /*
             * Only save contents that are files or notebooks with
             * a filepath already set.
             */
            content =>
              (content.type === "file" || content.type === "notebook") &&
              content.filepath !== ""
          )
          .keys()
      );
    }),
    filter((contentRef: ContentRef) => {
      const model = selectors.model(state$.value, { contentRef });
      if (model && model.type === "notebook") {
        return selectors.notebook.isDirty(model);
      }
      return false;
    }),
    map((contentRef: ContentRef) => actions.save({ contentRef }))
  );
}

function serializeContent(
  state: AppState,
  content:
    | RecordOf<NotebookContentRecordProps>
    | RecordOf<DummyContentRecordProps>
    | RecordOf<FileContentRecordProps>
    | RecordOf<DirectoryContentRecordProps>
): {
  saveModel: Partial<IContent<"file" | "notebook">> | null;
  serializedData: Notebook | string | null;
} {
  // This could be object for notebook, or string for files
  let serializedData: Notebook | string;
  let saveModel: Partial<IContent<"file" | "notebook">> = {};
  if (content.type === "notebook") {
    const appVersion = selectors.appVersion(state);

    // contents API takes notebook as raw JSON whereas downloading takes
    // a string
    serializedData = toJS(
      content.model.notebook.setIn(
        ["metadata", "nteract", "version"],
        appVersion
      )
    );
    saveModel = {
      content: serializedData,
      type: content.type
    };
  } else if (content.type === "file") {
    serializedData = content.model.text;
    saveModel = {
      content: serializedData,
      type: content.type,
      format: "text"
    };
  } else {
    return { saveModel: null, serializedData: null };
  }

  return { saveModel, serializedData };
}

export function saveContentEpic(
  action$: ActionsObservable<actions.Save | actions.DownloadContent>,
  state$: StateObservable<AppState>,
  dependencies: { contentProvider: IContentProvider }
): Observable<
  | actions.DownloadContentFailed
  | actions.DownloadContentFulfilled
  | actions.SaveFailed
  | actions.SaveFulfilled
> {
  return action$.pipe(
    ofType(actions.SAVE, actions.DOWNLOAD_CONTENT),
    mergeMap((action: actions.Save | actions.DownloadContent):
      | Observable<
          | actions.DownloadContentFailed
          | actions.DownloadContentFulfilled
          | actions.SaveFailed
          | actions.SaveFulfilled
        >
      | Observable<never> => {
      const state = state$.value;
      const contentRef = action.payload.contentRef;
      const content = selectors.content(state, { contentRef });

      // NOTE: This could save by having selectors for each model type
      //       have toDisk() selectors
      //       It will need to be cased off when we have more than one type
      //       of content we actually save
      if (!content) {
        const errorPayload = {
          error: new Error("Content was not set."),
          contentRef: action.payload.contentRef
        };
        if (action.type === actions.DOWNLOAD_CONTENT) {
          return of(actions.downloadContentFailed(errorPayload));
        }
        return of(actions.saveFailed(errorPayload));
      }

      if (content.type === "directory") {
        return of(
          actions.saveFailed({
            error: new Error("Cannot save directories."),
            contentRef: action.payload.contentRef
          })
        );
      }

      const filepath = content.filepath;

      const { serializedData, saveModel } = serializeContent(state, content);

      if (!saveModel || !serializedData) {
        return of(
          actions.saveFailed({
            error: new Error("No serialized model created for this content."),
            contentRef: action.payload.contentRef
          })
        );
      }

      switch (action.type) {
        case actions.DOWNLOAD_CONTENT: {
          // FIXME: Convert this to downloadString, so it works for
          //  both files & notebooks
          if (
            content.type === "notebook" &&
            typeof serializedData === "object"
          ) {
            downloadString(
              stringifyNotebook(serializedData),
              filepath || "notebook.ipynb",
              "application/json"
            );
          } else if (
            content.type === "file" &&
            typeof serializedData === "string"
          ) {
            downloadString(
              serializedData,
              filepath,
              content.mimetype || "application/octet-stream"
            );
          } else {
            // This shouldn't happen, is here for safety
            return EMPTY;
          }
          return of(
            actions.downloadContentFulfilled({
              contentRef: action.payload.contentRef
            })
          );
        }
        case actions.SAVE: {
          const host = selectors.currentHost(state) as JupyterHostRecord;
          const serverConfig: ServerConfig = selectors.serverConfig(host);

          return dependencies.contentProvider
            .save(serverConfig, filepath, saveModel)
            .pipe(
              mergeMap((saveXhr: AjaxResponse) => {
                if (saveXhr.response.errno) {
                  return of(
                    actions.saveFailed({
                      contentRef: action.payload.contentRef,
                      error: saveXhr.response
                    })
                  );
                }

                const pollIntervalMs = 500;
                const maxPollNb = 4;

                // Last_modified value from jupyter server is unreliable:
                // https://github.com/nteract/nteract/issues/4583
                // Check last-modified until value is stable.
                return interval(pollIntervalMs)
                  .pipe(take(maxPollNb))
                  .pipe(
                    mergeMap(_unused =>
                      dependencies.contentProvider
                        .get(serverConfig, filepath, { content: 0 })
                        .pipe(
                          map((innerXhr: AjaxResponse) => {
                            if (
                              innerXhr.status !== 200 ||
                              typeof innerXhr.response === "string"
                            ) {
                              return undefined;
                            }
                            return innerXhr.response.last_modified;
                          })
                        )
                    ),
                    distinctUntilChanged(),
                    mergeMap(lastModified => {
                      if (!lastModified) {
                        // Don't do anything special
                        return of(
                          actions.saveFulfilled({
                            contentRef: action.payload.contentRef,
                            model: saveXhr.response
                          })
                        );
                      }

                      // Update lastModified with the correct value
                      return of(
                        actions.saveFulfilled({
                          contentRef: action.payload.contentRef,
                          model: {
                            ...saveXhr.response,
                            last_modified: lastModified
                          }
                        })
                      );
                    })
                  );
              }),
              catchError((error: Error) =>
                of(
                  actions.saveFailed({
                    error,
                    contentRef: action.payload.contentRef
                  })
                )
              )
            );
        }
        default:
          // NOTE: Our ofType should prevent reaching here, this
          // is here merely as safety
          return EMPTY;
      }
    })
  );
}

export function saveAsContentEpic(
  action$: ActionsObservable<actions.SaveAs>,
  state$: StateObservable<AppState>,
  dependencies: { contentProvider: IContentProvider }
): Observable<actions.SaveAsFailed | actions.SaveAsFulfilled> {
  return action$.pipe(
    ofType(actions.SAVE_AS),
    mergeMap((action: actions.SaveAs):
      | Observable<actions.SaveAsFailed | actions.SaveAsFulfilled>
      | Observable<never> => {
      const state = state$.value;
      const contentRef = action.payload.contentRef;
      const content = selectors.content(state, { contentRef });

      if (!content) {
        const errorPayload = {
          error: new Error("Content was not set."),
          contentRef: action.payload.contentRef
        };
        return of(actions.saveAsFailed(errorPayload));
      }

      if (content.type === "directory") {
        return of(
          actions.saveAsFailed({
            error: new Error("Cannot save directories."),
            contentRef: action.payload.contentRef
          })
        );
      }

      const filepath = action.payload.filepath;

      const { saveModel } = serializeContent(state, content);

      if (!saveModel) {
        return of(
          actions.saveAsFailed({
            error: new Error("No serialized model created for this content."),
            contentRef: action.payload.contentRef
          })
        );
      }

      const host = selectors.currentHost(state) as JupyterHostRecord;
      const serverConfig = selectors.serverConfig(host);

      const kernelRef = selectors.kernelRefByContentRef(state, { contentRef });
      const alertKernelChanged: any[] = [];

      if (kernelRef) {
        const kernel = selectors.kernel(state, { kernelRef });

        if (kernel) {
          const cwd = path.dirname(path.resolve(filepath));
          if (cwd !== kernel.cwd) {
            alertKernelChanged.push(
              sendNotification.create({
                title: "Notebook folder changed",
                message:
                  "The kernel executing your code thinks your notebook is still " +
                  "in the old folder. Would you like to launch a new kernel in " +
                  "the new folder?",
                level: "warning",
                action: {
                  label: "Launch new kernel",
                  callback(): void {
                    if (window && (window as any).store) {
                      (window as any).store.dispatch(
                        actions.launchKernelByName({
                          kernelSpecName: kernel.kernelSpecName,
                          cwd,
                          kernelRef: createKernelRef(),
                          selectNextKernel: true,
                          contentRef
                        })
                      );
                    }
                  }
                }
              })
            );
          }
        }
      }

      return dependencies.contentProvider
        .save(serverConfig, filepath, saveModel)
        .pipe(
          mergeMap((xhr: AjaxResponse) => {
            return of(
              actions.changeFilename({
                contentRef: action.payload.contentRef,
                filepath
              }),
              actions.saveAsFulfilled({
                contentRef: action.payload.contentRef,
                model: xhr.response
              }),
              ...alertKernelChanged
            );
          }),
          catchError((error: Error) =>
            of(
              actions.saveAsFailed({
                error,
                contentRef: action.payload.contentRef
              })
            )
          )
        );
    })
  );
}

export function closeNotebookEpic(
  action$: ActionsObservable<actions.CloseNotebook>,
  state$: StateObservable<AppState>
): Observable<actions.DisposeContent | actions.KillKernelAction> {
  return action$.pipe(
    ofType(actions.CLOSE_NOTEBOOK),
    mergeMap(
      (
        action: actions.CloseNotebook
      ): Observable<actions.DisposeContent | actions.KillKernelAction> => {
        const state = state$.value;
        const contentRef = action.payload.contentRef;
        const kernelRef = selectors.kernelRefByContentRef(state, {
          contentRef
        });
        return of(
          actions.disposeContent({ contentRef }),
          actions.killKernel({ kernelRef, restarting: false, dispose: true })
        );
      }
    )
  );
}
