import { take, put } from 'redux-saga/effects';
import { fromJS } from 'immutable';

import {
  SET_NOTEBOOK, START_SETTING_NOTEBOOK
} from '../actions/constants';

import { newKernel } from '../actions';

export default function* setNotebook (notebookData) {
  while (true) {
    const { notebook } = yield take(START_SETTING_NOTEBOOK);

    const data = fromJS(notebook);

    yield put({
      type: SET_NOTEBOOK,
      data
    });

    const kernelName = data.getIn([
      'metadata', 'kernelspec', 'name'
    ], data.getIn([
      'metadata', 'language_info', 'name'
    ], 'python3'));

    yield put(newKernel(kernelName));
  }
}
