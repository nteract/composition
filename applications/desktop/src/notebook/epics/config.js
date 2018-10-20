/* @flow strict */
import { remote } from "electron";

import { actions, actionTypes } from "@nteract/core";
import { readFileObservable, writeFileObservable } from "fs-observable";
import { mapTo, mergeMap, map, switchMap } from "rxjs/operators";
import { ofType } from "redux-observable";

import type { ActionsObservable } from "redux-observable";

const path = require("path");

const HOME = remote.app.getPath("home");

export const CONFIG_FILE_PATH = path.join(HOME, ".jupyter", "nteract.json");

/**
 * An epic that loads the configuration.
 */
export const loadConfigEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.LOAD_CONFIG),
    switchMap(() =>
      readFileObservable(CONFIG_FILE_PATH).pipe(
        map(data => actions.configLoaded(JSON.parse(data)))
      )
    )
  );

/**
 * An epic that saves the configuration if it has been changed.
 */
export const saveConfigOnChangeEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.SET_CONFIG_AT_KEY),
    mapTo({ type: actionTypes.SAVE_CONFIG })
  );

/**
 * An epic that saves the configuration.
 */
export const saveConfigEpic = (action$: ActionsObservable<*>, store: *) =>
  action$.pipe(
    ofType(actionTypes.SAVE_CONFIG),
    mergeMap(() =>
      writeFileObservable(
        CONFIG_FILE_PATH,
        JSON.stringify(store.getState().config.toJS())
      ).pipe(map(actions.doneSavingConfig))
    )
  );
