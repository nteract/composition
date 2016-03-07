/**
 * Converting Observable's push nature to Saga's pull nature is more involved
 * than I thought it would be, but very possible. The file below is not finished,
 * but this Github issue should offer you several solutions: https://github.com/yelouafi/redux-saga/issues/172
 *
 * My apologies for leaving the file in this state.
 */

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

import { updateCellOutputs } from '../actions';

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../api/messaging';

const proxyIoPub = (messages) => new Promise((resolve, reject) => {
  messages
    .ofMessageType(['execute_input'])
    .pluck('content', 'execution_count')
    .first()
    .subscribe(ct => {
      resolve(ct)
    });
});

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

      const childMessages = iopub.childOf(executeRequest).share();

      const ct = yield fork(
        call(
          proxyIoPub,
          childMessages
        )
      );

      yield forkput(updateCellOutputs(id, ct));

      // TODO: implement

      // childMessages
      //   .ofMessageType(nbFormattableTypes)
      //   .map(msgSpecToNotebookFormat)
      //   // Iteratively reduce on the outputs
      //   .scan((outputs, output) => {
      //     if(output.output_type === 'clear_output') {
      //       return List();
      //     }
      //     return outputs.push(fromJS(output));
      //   }, List())
      //   // Update the outputs with each change
      //   .subscribe(update)

      shell.next(executeRequest);
    }
  }
}
