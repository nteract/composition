import {
  take
} from 'redux-saga/effects';
import remote from 'remote';
const dialog = remote.require('dialog');
import { extname } from 'path';
import { writeFile } from 'fs';


import {
  SAVE, SAVE_AS,
  START_SAVING, DONE_SAVING
} from '../actions/constants';

export default function* save (getState) {
  while (true) {

    // Wait for SAVE action
    yield take(SAVE);

    const state = getState();

    const hasFilename = state.hasIn(['notebook', 'filename']);

    // No filename, so open "Save as" dialog instead.
    if (!hasFilename) {
      const opts = {
        title: 'Save Notebook As',
        filters: [
          {
            name: 'Notebooks',
            extensions: ['ipynb']
          }
        ]
      };
      yield call(dialog.showSaveDialog, function* (opts, filename) {
        if (!filename) return;
        if (path.extname(filename) === '') {
          filename = filename + '.ipynb';
        }
        yield put({
          type: SAVE_AS,
          filename
        });
      });

    }

    // Alright, we have a file name. Write to file.
    if (hasFilename) {
      yield put({
        type: START_SAVING
      });

      yield call(
        writeFile,
        state.getIn(['notebook', 'filename']),
        JSON.stringify(commutable.toJS(state.get('notebook')), null, 2),
        function* (err) {
          if (err) {
            console.error(err);
            throw err;
          }

          yield put({
            type: DONE_SAVING
          });
        }
      )
    }
  }
}

export function* saveAs(getState) {
  while (true) {
    const { filename } = yield take(SAVE_AS);
    yield put({
      type: CHANGE_FILENAME,
      filename
    });
    yield put({ type: SAVE });
  }
}
