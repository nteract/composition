import { remote } from 'electron';

import {
  MERGE_CONFIG,
  SET_CONFIG_KEY,
  DONE_SAVING_CONFIG,
} from '../constants';

import { readFileObservable, writeFileObservable } from '../../utils/fs';

const path = require('path');

const Rx = require('rxjs/Rx');
const jupyterPaths = require('jupyter-paths');

const Observable = Rx.Observable;

export const LOAD_CONFIG = 'LOAD_CONFIG';
export const loadConfig = () => ({ type: LOAD_CONFIG });

export const SAVE_CONFIG = 'SAVE_CONFIG';
export const saveConfig = () => ({ type: SAVE_CONFIG });
export const doneSavingConfig = () => ({ type: DONE_SAVING_CONFIG });

export const configLoaded = (config) => ({
  type: MERGE_CONFIG,
  config,
});

const HOME = remote.app.getPath('home');

export const CONFIG_FILE_PATH = path.join(HOME, '.jupyter', 'nteract.json');

/**
  * An epic that loads the configuration.
  *
  * @param  {ActionObservable}  actions ActionObservable containing type
  * @return {ActionObservable}  ActionObservable with MERGE_CONFIG type
  */
export const loadConfigEpic = actions =>
  actions.ofType(LOAD_CONFIG)
    .switchMap(action =>
      readFileObservable(CONFIG_FILE_PATH)
        .map(JSON.parse)
        .map(configLoaded)
        .catch((err) =>
          Observable.of({ type: 'ERROR', payload: err, error: true })
        )
    );

/**
  * An epic that saves the configuration if it has been changed.
  *
  * @param  {ActionObservable}  actions ActionObservable containing type
  * @return {ActionObservable}  ActionObservable with SAVE_CONFIG type
  */
export const saveConfigOnChangeEpic = actions =>
  actions.ofType(SET_CONFIG_KEY)
    .mapTo({ type: SAVE_CONFIG });

/**
  * An epic that saves the configuration.
  *
  * @param  {ActionObservable}  actions ActionObservable containing type
  * @return {ActionObservable}  ActionObservable containing DONE_SAVING type
  */
export const saveConfigEpic = actions =>
  actions.ofType(SAVE_CONFIG)
    .mergeMap(action =>
      writeFileObservable(CONFIG_FILE_PATH, JSON.stringify(store.getState().config.toJS()))
      .map(doneSavingConfig)
    )
    .catch((err) =>
      Observable.of({ type: 'ERROR', payload: err, error: true })
    );
