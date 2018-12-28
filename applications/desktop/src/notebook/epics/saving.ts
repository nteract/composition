import { ofType } from "redux-observable";
import { ActionsObservable, StateObservable } from "redux-observable";
import { writeFileObservable } from "fs-observable";
import { selectors, actions } from "@nteract/core";
import { AppState } from "@nteract/core";
import { toJS, stringifyNotebook } from "@nteract/commutable";
import { of } from "rxjs";
import { mergeMap, catchError, map, concatMap } from "rxjs/operators";

import { Actions } from "../actions";

/**
 * Cleans up the notebook document and saves the file.
 *
 * @param  {ActionObservable}  action$ The SAVE action with the filename and notebook
 */
export function saveEpic(
  action$: ActionsObservable<Actions>,
  state$: StateObservable<AppState>
) {
  return action$.pipe(
    ofType(actions.SAVE),
    mergeMap((action: actions.Save) => {
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
      const appVersion = selectors.appVersion(state);
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
export function saveAsEpic(action$: ActionsObservable<Actions>) {
  return action$.pipe(
    ofType(actions.SAVE_AS),
    concatMap((action: actions.SaveAs) => {
      return [
        // Using concatMap because order matters here.
        // Filename state MUST be updated before save in all cases
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