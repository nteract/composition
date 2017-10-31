/* @flow */

import { ActionsObservable } from "redux-observable"; /* eslint-disable no-unused-vars */
import { writeFileObservable } from "fs-observable";
import { SAVE, SAVE_AS } from "@nteract/core/constants";

import { changeFilename, save, doneSaving } from "@nteract/core/actions";

import { toJS, stringifyNotebook } from "@nteract/commutable";

import { remote } from "electron";

import { of } from "rxjs/observable/of";
import { tap, mergeMap, catchError, map } from "rxjs/operators";

/**
  * Cleans up the notebook document and saves the file.
  *
  * @param  {ActionObservable}  action$ The SAVE action with the filename and notebook
  */
export function saveEpic(
  action$: ActionsObservable<*>,
  store: Store<any, any>
) {
  return action$.ofType(SAVE).pipe(
    tap(action => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error("save needs a filename");
      }
    }),
    mergeMap(action =>
      writeFileObservable(
        action.filename,
        // $FlowFixMe: We're totally using this argument, not sure what's up here
        stringifyNotebook(
          toJS(
            action.notebook.setIn(
              ["metadata", "nteract", "version"],
              remote.app.getVersion()
            )
          )
        )
      ).pipe(
        catchError((error: Error) =>
          of({
            type: "ERROR",
            payload: error,
            error: true
          })
        ),
        map(() => {
          if (process.platform !== "darwin") {
            const state = store.getState();
            const notificationSystem = state.app.get("notificationSystem");
            notificationSystem.addNotification({
              title: "Save successful!",
              autoDismiss: 2,
              level: "success"
            });
          }
          return doneSaving(action.notebook);
        })
      )
    )
    // .startWith({ type: START_SAVING })
    // since SAVE effectively acts as the same as START_SAVING
    // you could just look for that in your reducers instead of START_SAVING
  );
}

/**
  * Sets the filename for a notebook before saving.
  *
  * @param  {ActionObservable}  action$ The SAVE_AS action with the filename and notebook
  */
export function saveAsEpic(action$: ActionsObservable<*>) {
  return action$
    .ofType(SAVE_AS)
    .pipe(
      mergeMap(action => [
        changeFilename(action.filename),
        save(action.filename, action.notebook)
      ])
    );
}
