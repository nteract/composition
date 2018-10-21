/* @flow strict */
import { ofType } from "redux-observable";
import type { ActionsObservable, StateObservable } from "redux-observable";
import { writeFileObservable } from "fs-observable";
import { actionTypes, selectors, actions } from "@nteract/core";
import type { AppState } from "@nteract/core";
import { toJS, stringifyNotebook } from "@nteract/commutable";
import { of } from "rxjs";
import { mergeMap, catchError, map } from "rxjs/operators";

/**
 * Cleans up the notebook document and saves the file.
 *
 * @param  {ActionObservable}  action$ The SAVE action with the filename and notebook
 */
export function saveEpic(
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) {
  return action$.pipe(
    ofType(actionTypes.SAVE),
    mergeMap((action: actionTypes.Save) => {
      const state = state$.value;
      const contentRef = action.payload.contentRef;

      const content = selectors.content(state, { contentRef });
      if (!content) {
        return of(
          actions.saveFailed({
            error: new Error("no notebook loaded to save"),
            contentRef: action.payload.contentRef
          })
        );
      }
      const model = content.model;

      if (!model || model.type !== "notebook") {
        return of(
          actions.saveFailed({
            error: new Error("no notebook loaded to save"),
            contentRef: action.payload.contentRef
          })
        );
      }

      const filepath = content.filepath;
      // TODO: this default version should probably not be here.
      const appVersion = selectors.appVersion(state) || "0.0.0-beta";
      const notebook = stringifyNotebook(
        toJS(
          model.notebook.setIn(["metadata", "nteract", "version"], appVersion)
        )
      );
      return writeFileObservable(filepath, notebook).pipe(
        map(() => {
          if (process.platform !== "darwin") {
            const notificationSystem = selectors.notificationSystem(
              state$.value
            );
            notificationSystem.addNotification({
              title: "Save successful!",
              autoDismiss: 2,
              level: "success"
            });
          }
          return actions.saveFulfilled({
            contentRef: action.payload.contentRef,
            model: {
              last_modified: new Date()
            }
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

/**
 * Sets the filename for a notebook before saving.
 *
 * @param  {ActionObservable}  action$ The SAVE_AS action with the filename and notebook
 */
export function saveAsEpic(action$: ActionsObservable<redux$Action>) {
  return action$.pipe(
    ofType(actionTypes.SAVE_AS),
    mergeMap((action: actionTypes.SaveAs) => {
      return [
        // order matters here, since we need the filename set in the state
        // before we save the document
        actions.changeFilename({
          filepath: action.payload.filepath,
          contentRef: action.payload.contentRef
        }),
        actions.save({
          contentRef: action.payload.contentRef
        })
      ];
    })
  );
}
