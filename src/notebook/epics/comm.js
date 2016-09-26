import Rx from 'rxjs/Rx';

import {
  createMessage,
} from '../kernel/messaging';

import {
  COMM_OPEN,
  COMM_MESSAGE,
  COMM_ERROR,
  NEW_KERNEL,
} from '../constants';

/**
 * creates a comm open message
 * @param  {string} comm_id       uuid
 * @param  {string} target_name   comm handler
 * @param  {any} data             up to the target handler
 * @param  {string} target_module [Optional] used to select a module that is responsible for handling the target_name
 * @return {jmp.Message}          Message ready to send on the shell channel
 */
export function createCommOpenMessage(comm_id, target_name, data = {}, target_module) {
  const msg = createMessage('comm_open', { content: { comm_id, target_name, data } });
  if (target_module) {
    msg.content.target_module = target_module;
  }
  return msg;
}

// TODO: buffer/blob handling on comm messages
export function createCommMessage(comm_id, data = {}) {
  return createMessage('comm_msg', { content: { comm_id, data } });
}

export function createCommCloseMessage(parent_header, comm_id, data = {}) {
  return createMessage('comm_close', { content: { comm_id, data }, parent_header });
}

export const createCommErrorAction = (error) =>
  Rx.Observable.of({
    type: COMM_ERROR,
    payload: error,
    error: true,
  });

function commOpenAction(message) {
  // invariant: expects a comm_open message
  return {
    type: COMM_OPEN,
    data: message.content.data,
    metadata: message.content.metadata,
    comm_id: message.content.comm_id,
    target_name: message.content.target_name,
    target_module: message.content.target_module,
    // Pass through the buffers
    buffers: message.blob || message.buffers,
    // NOTE: Naming inconsistent between jupyter notebook and jmp
    //       see https://github.com/n-riesco/jmp/issues/14
    //       We just expect either one
  };
}

function commMessageAction(message) {
  return {
    type: COMM_MESSAGE,
    comm_id: message.content.comm_id,
    data: message.content.data,
    // Pass through the buffers
    buffers: message.blob || message.buffers,
    // NOTE: Naming inconsistent between jupyter notebook and jmp
    //       see https://github.com/n-riesco/jmp/issues/14
    //       We just expect either one
  };
}


export const commListenEpic = (action$, store) =>
  action$.ofType(NEW_KERNEL)
    // We have a new channel
    .switchMap(action => {
      const commOpenAction$ = action.channels.iopub
        .ofMessageType(['comm_open'])
        .map(commOpenAction);

      const commMessageAction$ = action.channels.iopub
        .ofMessageType(['comm_msg'])
        .map(commMessageAction);

      return Rx.Observable.merge(
        commOpenAction$,
        commMessageAction$
      );
    })
    .catch(createCommErrorAction);
