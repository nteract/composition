// @flow
import { of } from "rxjs/observable/of";
import { merge } from "rxjs/observable/merge";
import { map, retry, switchMap } from "rxjs/operators";

import { createMessage, ofMessageType, childOf } from "@nteract/messaging";

import type { ActionsObservable } from "redux-observable";

import {
  COMM_OPEN,
  COMM_MESSAGE,
  COMM_ERROR,
  NEW_KERNEL
} from "@nteract/core/constants";

/**
 * creates a comm open message
 * @param  {string} comm_id       uuid
 * @param  {string} target_name   comm handler
 * @param  {any} data             up to the target handler
 * @param  {string} target_module [Optional] used to select a module that is responsible for handling the target_name
 * @return {jmp.Message}          Message ready to send on the shell channel
 */
export function createCommOpenMessage(
  comm_id: string,
  target_name: string,
  data: any = {},
  target_module: string
) {
  const msg = createMessage("comm_open", {
    content: { comm_id, target_name, data }
  });
  if (target_module) {
    msg.content.target_module = target_module;
  }
  return msg;
}

/**
 * creates a comm message for sending to a kernel
 * @param  {string}     comm_id    unique identifier for the comm
 * @param  {Object}     data       any data to send for the comm
 * @param  {Uint8Array} buffers    arbitrary binary data to send on the comm
 * @return {jmp.Message}           jupyter message for comm_msg
 */
export function createCommMessage(
  comm_id: string,
  data: any = {},
  buffers: Uint8Array = new Uint8Array([])
) {
  return createMessage("comm_msg", { content: { comm_id, data }, buffers });
}

/**
 * creates a comm close message for sending to a kernel
 * @param  {Object} parent_header    header from a parent jupyter message
 * @param  {string}     comm_id      unique identifier for the comm
 * @param  {Object}     data         any data to send for the comm
 * @return {jmp.Message}             jupyter message for comm_msg
 */
export function createCommCloseMessage(
  parent_header: any,
  comm_id: string,
  data: any = {}
) {
  return createMessage("comm_close", {
    content: { comm_id, data },
    parent_header
  });
}

/**
 * creates a comm error action
 * @param  {error} error any type of error to pass on
 * @return {Object}       Flux standard error action
 */
export const createCommErrorAction = (error: Error) =>
  of({
    type: COMM_ERROR,
    payload: error,
    error: true
  });

/**
 * Action creator for comm_open messages
 * @param  {jmp.Message} a comm_open message
 * @return {Object}      COMM_OPEN action
 */
export function commOpenAction(message: any) {
  // invariant: expects a comm_open message
  return {
    type: COMM_OPEN,
    data: message.content.data,
    metadata: message.content.metadata,
    comm_id: message.content.comm_id,
    target_name: message.content.target_name,
    target_module: message.content.target_module,
    // Pass through the buffers
    buffers: message.blob || message.buffers
    // NOTE: Naming inconsistent between jupyter notebook and jmp
    //       see https://github.com/n-riesco/jmp/issues/14
    //       We just expect either one
  };
}

/**
 * Action creator for comm_msg messages
 * @param  {jmp.Message} a comm_msg
 * @return {Object}      COMM_MESSAGE action
 */
export function commMessageAction(message: any) {
  return {
    type: COMM_MESSAGE,
    comm_id: message.content.comm_id,
    data: message.content.data,
    // Pass through the buffers
    buffers: message.blob || message.buffers
    // NOTE: Naming inconsistent between jupyter notebook and jmp
    //       see https://github.com/n-riesco/jmp/issues/14
    //       We just expect either one
  };
}

/**
 * creates all comm related actions given a new kernel action
 * @param  {Object} newKernelAction a NEW_KERNEL action
 * @return {ActionsObservable}          all actions resulting from comm messages on this kernel
 */
export function commActionObservable(newKernelAction: any) {
  const commOpenAction$ = newKernelAction.channels.iopub.pipe(
    ofMessageType("comm_open"),
    map(commOpenAction)
  );

  const commMessageAction$ = newKernelAction.channels.iopub.pipe(
    ofMessageType("comm_msg"),
    map(commMessageAction)
  );

  return merge(commOpenAction$, commMessageAction$).pipe(retry());
}

/**
 * An epic that emits comm actions from the backend kernel
 * @param  {ActionsObservable} action$ Action Observable from redux-observable
 * @param  {redux.Store} store   the redux store
 * @return {ActionsObservable}         Comm actions
 */
export const commListenEpic = (action$: ActionsObservable<*>) =>
  action$.ofType(NEW_KERNEL).pipe(switchMap(commActionObservable)); // We have a new channel
