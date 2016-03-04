import {
  take,
  put,
  call
} from 'redux-saga/effects';
import { List, fromJS } from 'immutable';

import {
  EXECUTE_CELL,
  ERROR_KERNEL_NOT_CONNECTED
} from '../actions/constants';

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../api/messaging';

export default function* executeCell (getState) {
  while (true) {
    const { id, source } = yield take(EXECUTE_CELL);

    const state = getState();
    const iopub = state.getIn(['kernel', 'channels', 'iopub']);
    const shell = state.getIn(['kernel', 'channels', 'shell']);

    if (!iopub || !shell) {
      yield put({
        type: ERROR_KERNEL_NOT_CONNECTED
      });
    } else {
      const executeRequest = createExecuteRequest(source);

      const nbFormattableTypes = ['execute_result', 'display_data', 'stream', 'error', 'clear_output'];

      shell.subscribe(() => {});

      yield put(updateCellOutputs(id, List()));

      const childMessages = iopub.childOf(executeRequest).share();

      childMessages
        .ofMessageType(['execute_input'])
        .pluck('content', 'execution_count')
        .first()
        .subscribe(function* (ct) {
          // console.log(ct);
          yield put(updateCellExecutionCount(id, ct));
        });

      childMessages
        .ofMessageType(nbFormattableTypes)
        .map(msgSpecToNotebookFormat)
        // Iteratively reduce on the outputs
        .scan((outputs, output) => {
          if(output.output_type === 'clear_output') {
            return List();
          }
          return outputs.push(fromJS(output));
        }, List())
        // Update the outputs with each change
        .subscribe(function* (outputs) {
          yield put(updateCellOutputs(id, outputs));
        });

      shell.next(executeRequest);
    }
  }
}
