/* @flow */
import { empty, from, of, interval } from "rxjs";
import { tap, map, mergeMap, switchMap, catchError } from "rxjs/operators";
import { ofType } from "redux-observable";
import { sample } from "lodash";
import FileSaver from "file-saver";
import type { ActionsObservable, StateObservable } from "redux-observable";
import { contents } from "rx-jupyter";
import { toJS, stringifyNotebook } from "@nteract/commutable";
import type { Notebook } from "@nteract/commutable";

import * as actions from "../actions";
import * as actionTypes from "../actionTypes";
import * as selectors from "../selectors";
import type { ContentRef, AppState } from "../state";

export function fetchContentEpic(
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) {
  return action$.pipe(
    ofType(actionTypes.FETCH_CONTENT),
    switchMap((action: actionTypes.FetchContent) => {
      if (!action.payload || typeof action.payload.filepath !== "string") {
        return of({
          type: "ERROR",
          error: true,
          payload: { error: new Error("fetching content needs a payload") }
        });
      }

      const state = state$.value;

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      return contents
        .get(serverConfig, action.payload.filepath, action.payload.params)
        .pipe(
          tap(xhr => {
            if (xhr.status !== 200) {
              throw new Error(xhr.response);
            }
          }),
          map(xhr => {
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
) {
  const filename = filepath.split("/").pop();
  const blob = new Blob([fileContents], { type: contentType });
  // NOTE: There is no callback for this, we have to rely on the browser
  //       to do this well, so we assume it worked
  FileSaver.saveAs(blob, filename);
}

// Generated with Python + SymPy
// >>> import sympy
// >>> import random
// >>> random.sample(list(sympy.primerange(28000, 32000)), 30)

const someArbitraryPrimesAround30k = [
  30137,
  30713,
  30593,
  28403,
  29153,
  30509,
  31727,
  28229,
  29327,
  28867,
  28201,
  31907,
  29167,
  28433,
  28151,
  31063,
  29833,
  29243,
  28901,
  28909,
  28607,
  30517,
  28307,
  28547,
  29009,
  31183,
  30773,
  29017,
  31601,
  28109
];

export function autoSaveCurrentContentEpic(
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) {
  // Pick an autosave duration that won't have the exact same cycle as another open tab
  const duration = sample(someArbitraryPrimesAround30k);

  return interval(duration).pipe(
    mergeMap(() => {
      const state = state$.value;

      const contentRef$ = from(
        state.core.entities.contents.byRef
          .filter(
            // Don't bother with non-file and non-notebook types for saving
            // (no dummy or directory)
            content => content.type === "file" || content.type === "notebook"
          )
          .keys()
      );

      return contentRef$;
    }),
    // TODO: Once we're switched to the coming redux observable 1.0.0 release,
    // we should use the state$ stream to only save when the content has changed
    mergeMap((contentRef: ContentRef) => {
      const state = state$.value;
      const content = selectors.content(state, { contentRef });

      let isVisible = false;

      // document.hidden appears well supported
      if (typeof document.hidden !== "undefined") {
        // Opera 12.10 and Firefox 18 and later support
        isVisible = !document.hidden;
        // $FlowAllowFeatureDetection
      } else if (typeof document.msHidden !== "undefined") {
        isVisible = !document.msHidden;
        // $FlowAllowFeatureDetection
      } else if (typeof document.webkitHidden !== "undefined") {
        isVisible = !document.webkitHidden;
      } else {
        // Final fallback -- this will say the window is hidden when devtools is open or if the
        // user is interacting with an iframe
        isVisible = document.hasFocus();
      }

      if (
        isVisible &&
        // Don't bother saving nothing
        content &&
        // Only files and notebooks
        (content.type === "file" || content.type === "notebook") &&
        // Only save if they have a real filepath
        content.filepath !== ""
      ) {
        return of(actions.save({ contentRef }));
      } else {
        return empty();
      }
    })
  );
}

export function saveContentEpic(
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) {
  return action$.pipe(
    ofType(actionTypes.SAVE, actionTypes.DOWNLOAD_CONTENT),
    mergeMap((action: actionTypes.Save | actionTypes.DownloadContent) => {
      const state = state$.value;

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
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
        if (action.type === actionTypes.DOWNLOAD_CONTENT) {
          return of(actions.downloadContentFailed(errorPayload));
        }
        return of(actions.saveFailed(errorPayload));
      }

      if (content.type === "directory") {
        // Don't save directories
        return empty();
      }

      let filepath = content.filepath;

      // This could be object for notebook, or string for files
      let serializedData: Notebook | string;
      let saveModel = {};
      if (content.type === "notebook") {
        // TODO: this default version should probably not be here.
        const appVersion = selectors.appVersion(state) || "0.0.0-beta";

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
        // We shouldn't save directories
        return empty();
      }

      switch (action.type) {
        case actionTypes.DOWNLOAD_CONTENT: {
          // FIXME: Convert this to downloadString, so it works for both files & notebooks
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
            return empty();
          }
          return of(
            actions.downloadContentFulfilled({
              contentRef: action.payload.contentRef
            })
          );
        }
        case actionTypes.SAVE: {
          const serverConfig = selectors.serverConfig(host);

          // Check to see if the file was modified since the last time we saved
          // TODO: Determine how we handle what to do
          // Don't bother doing this if the file is new(?)
          return contents.get(serverConfig, filepath, { content: 0 }).pipe(
            // Make sure that the modified time is within some delta
            mergeMap(xhr => {
              // TODO: What does it mean if we have a failed GET on the content
              if (xhr.status !== 200) {
                throw new Error(xhr.response);
              }
              const model = xhr.response;

              const diskDate = new Date(model.last_modified);
              const inMemoryDate = content.lastSaved
                ? new Date(content.lastSaved)
                : // FIXME: I'm unsure if we don't have a date if we should default to the disk date
                  diskDate;

              if (Math.abs(diskDate - inMemoryDate) > 600) {
                return of(
                  actions.saveFailed({
                    error: new Error("open in another tab possibly..."),
                    contentRef: action.payload.contentRef
                  })
                );
              }

              return contents.save(serverConfig, filepath, saveModel).pipe(
                map(xhr => {
                  return actions.saveFulfilled({
                    contentRef: action.payload.contentRef,
                    model: xhr.response
                  });
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
            })
          );
        }
        default:
          // NOTE: Flow types and our ofType should prevent reaching here, this
          // is here merely as safety
          return empty();
      }
    })
  );
}
