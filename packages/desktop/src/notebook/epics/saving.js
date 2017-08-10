/* @flow */

import { ActionsObservable } from "redux-observable"; /* eslint-disable no-unused-vars */
import { writeFileObservable } from "../../utils/fs";
import { SAVE, SAVE_AS } from "../constants";

import { changeFilename, save, doneSaving } from "../actions";

import { toJS, stringifyNotebook } from "@nteract/commutable";

import { remote } from "electron";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/observable/merge";

import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/catch";

/**
  * Cleans up the notebook document and saves the file.
  *
  * @param  {ActionObservable}  action$ The SAVE action with the filename and notebook
  */
export function saveEpic(action$: ActionsObservable, store: Store<any, any>) {
  return action$
    .ofType(SAVE)
    .do(action => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error("save needs a filename");
      }
    })
    .mergeMap(
      action =>
        writeFileObservable(
          action.filename,
          stringifyNotebook(
            toJS(
              action.notebook.setIn(
                ["metadata", "nteract", "version"],
                remote.app.getVersion()
              )
            )
          )
        )
          .catch((error: Error) =>
            Observable.of({
              type: "ERROR",
              payload: error,
              error: true
            })
          )
          .map(() => {
            const state = store.getState();
            const notificationSystem = state.app.get("notificationSystem");
            notificationSystem.addNotification({
              title: "Save successful!",
              autoDismiss: 2,
              level: "success"
            });
            return doneSaving();
          })
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
export function saveAsEpic(action$: ActionsObservable) {
  return action$
    .ofType(SAVE_AS)
    .mergeMap(action => [
      changeFilename(action.filename),
      save(action.filename, action.notebook)
    ]);
}
