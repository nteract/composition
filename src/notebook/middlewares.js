import { List } from 'immutable';

import * as constants from './constants';
import { setModified } from './actions';

export const errorLogger = store => next => action => {
  if (action.error) {
    const state = store.getState();
    console.warn('state', state);
    console.error(action);
  }
  return next(action);
};

export const triggerModified = store => next => action => {
  const ignore = new List([
    constants.CHANGE_FILENAME,
    constants.NEW_KERNEL,
    constants.KILL_KERNEL,
    constants.INTERRUPT_KERNEL,
    constants.SET_NOTEBOOK,
    constants.UPDATE_CELL_EXECUTION_COUNT,
    constants.CHANGE_OUTPUT_VISIBILITY,
    constants.CHANGE_INPUT_VISIBILITY,
    constants.UPDATE_CELL_PAGERS,
    constants.SET_LANGUAGE_INFO,
    constants.SET_EXECUTION_STATE,
    constants.FOCUS_CELL,
    constants.FOCUS_NEXT_CELL,
    constants.FOCUS_PREVIOUS_CELL,
    constants.TOGGLE_STICKY_CELL,
    constants.STARTED_UPLOADING,
    constants.DONE_UPLOADING,
    constants.SET_NOTIFICATION_SYSTEM,
    constants.ASSOCIATE_CELL_TO_MSG,
    constants.SET_FORWARD_CHECKPOINT,
    constants.SET_BACKWARD_CHECKPOINT,
    constants.CLEAR_FUTURE,
    constants.SET_MODIFIED,
  ]);

  if (ignore.indexOf(action.type) === -1) {
    store.dispatch(setModified(true));
  }
  if (action.type === constants.DONE_SAVING) {
    store.dispatch(setModified(false));
  }

  return next(action);
};
