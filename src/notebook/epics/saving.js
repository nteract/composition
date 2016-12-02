import { ActionsObservable } from 'redux-observable';
import { writeFileObservable } from '../../utils/fs';
import {
  SAVE,
  SAVE_AS,
  CHANGE_FILENAME,
  DONE_SAVING,
} from '../constants';

import {
  changeFilename,
  save,
  saveAs,
  doneSaving,
} from '../actions';

const Rx = require('rxjs/Rx');
const commutable = require('commutable');

const Observable = Rx.Observable;

/**
  * Cleans up the notebook document and saves the file.
  *
  * @param  {ActionObservable}  action$ The SAVE action with the filename and notebook
  */
export function saveEpic(action$) {
  return action$.ofType(SAVE)
    .do(action => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error('save needs a filename');
      }
    })
    .mergeMap(action =>
      writeFileObservable(action.filename,
        JSON.stringify(
          commutable.toJS(
            action.notebook.update('cellMap', (cells) =>
              cells.map((value) =>
                value.deleteIn(['metadata', 'inputHidden'])
                  .deleteIn(['metadata', 'outputHidden'])
                  .deleteIn(['metadata', 'status'])))),
          null,
          1))
        .catch(error => {
          const input$ = Observable.of({
            type: 'ERROR',
            payload: error,
            error: true,
          });
          return new ActionsObservable(input$);
        })
        .map(doneSaving)
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
export function saveAsEpic(action$) {
  return action$.ofType(SAVE_AS)
    .mergeMap(action => [
      changeFilename(action.filename),
      save(action.filename, action.notebook),
    ]);
}
