import { remote } from "electron";

import { MERGE_CONFIG, SET_CONFIG_KEY, DONE_SAVING_CONFIG } from "../constants";

import { readFileObservable, writeFileObservable } from "../../utils/fs";

const path = require("path");

export const LOAD_CONFIG = "LOAD_CONFIG";
export const loadConfig = () => ({ type: LOAD_CONFIG });

import "rxjs/add/operator/mapTo";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/map";

export const SAVE_CONFIG = "SAVE_CONFIG";
export const saveConfig = () => ({ type: SAVE_CONFIG });
export const doneSavingConfig = () => ({ type: DONE_SAVING_CONFIG });

export const configLoaded = config => ({
  type: MERGE_CONFIG,
  config
});

const HOME = remote.app.getPath("home");

export const CONFIG_FILE_PATH = path.join(HOME, ".jupyter", "nteract.json");

/**
  * An epic that loads the configuration.
  *
  * @param  {ActionObservable}  actions ActionObservable for LOAD_CONFIG action
  * @return {ActionObservable}  ActionObservable for MERGE_CONFIG action
  */
export const loadConfigEpic = actions =>
  actions
    .ofType(LOAD_CONFIG)
    .switchMap(() =>
      readFileObservable(CONFIG_FILE_PATH).map(JSON.parse).map(configLoaded)
    );

/**
  * An epic that saves the configuration if it has been changed.
  *
  * @param  {ActionObservable}  actions ActionObservable for SET_CONFIG_KEY action
  * @return {ActionObservable}  ActionObservable with SAVE_CONFIG type
  */
export const saveConfigOnChangeEpic = actions =>
  actions.ofType(SET_CONFIG_KEY).mapTo({ type: SAVE_CONFIG });

/**
  * An epic that saves the configuration.
  *
  * @param  {ActionObservable}  actions ActionObservable containing SAVE_CONFIG action
  * @return {ActionObservable}  ActionObservable for DONE_SAVING action
  */
export const saveConfigEpic = (actions, store) =>
  actions
    .ofType(SAVE_CONFIG)
    .mergeMap(() =>
      writeFileObservable(
        CONFIG_FILE_PATH,
        JSON.stringify(store.getState().config.toJS())
      ).map(doneSavingConfig)
    );
