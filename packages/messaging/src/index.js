// @flow
/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";
import { _throw } from "rxjs/observable/throw";

import {
  pluck,
  first,
  groupBy,
  filter,
  scan,
  map,
  mapTo,
  switchMap,
  mergeAll,
  mergeMap,
  takeUntil,
  catchError,
  tap
} from "rxjs/operators";

import { message, executeRequest } from "./messages";

import type { JupyterMessage, ExecuteRequest } from "./types";

// TODO: Deprecate
export function createMessage(
  msg_type: string,
  fields: Object = {}
): JupyterMessage<*, *> {
  return { ...message({ msg_type }), ...fields };
}

// TODO: Deprecate
export function createExecuteRequest(code: string = ""): ExecuteRequest {
  return executeRequest(code, {});
}

/**
 * operator for getting all messages that declare their parent header as
 * parentMessage's header
 */
export const childOf = (parentMessage: JupyterMessage<*, *>) => (
  source: rxjs$Observable<JupyterMessage<*, *>>
) => {
  const parentMessageID = parentMessage.header.msg_id;
  return new Observable(subscriber =>
    source.subscribe(
      msg => {
        if (!msg.parent_header || !msg.parent_header.msg_id) {
          subscriber.error(new Error("no parent_header.msg_id on message"));
          return;
        }

        if (parentMessageID === msg.parent_header.msg_id) {
          subscriber.next(msg);
        }
      },
      // be sure to handle errors and completions as appropriate and
      // send them along
      err => subscriber.error(err),
      () => subscriber.complete()
    )
  );
};

/**
 * ofMessageType is an Rx Operator that filters on msg.header.msg_type
 * being one of messageTypes
 * @param  {Array} messageTypes e.g. ['stream', 'error']
 * @return {Observable}                 the resulting observable
 */
export const ofMessageType = (
  ...messageTypes: Array<string> | [Array<string>]
) => {
  // Switch to the splat mode
  if (messageTypes.length === 1 && Array.isArray(messageTypes[0])) {
    return ofMessageType(...messageTypes[0]);
  }

  return (
    source: rxjs$Observable<JupyterMessage<*, *>>
  ): rxjs$Observable<JupyterMessage<*, *>> =>
    new Observable(subscriber =>
      source.subscribe(
        msg => {
          if (!msg.header || !msg.header.msg_type) {
            subscriber.error(new Error("no header.msg_type on message"));
            return;
          }

          if (messageTypes.indexOf(msg.header.msg_type) !== -1) {
            subscriber.next(msg);
          }
        },
        // be sure to handle errors and completions as appropriate and
        // send them along
        err => subscriber.error(err),
        () => subscriber.complete()
      )
    );
};

/**
 * Create an object that adheres to the jupyter notebook specification.
 * http://jupyter-client.readthedocs.io/en/latest/messaging.html
 *
 * @param {Object} msg - Message that has content which can be converted to nbformat
 * @return {Object} formattedMsg  - Message with the associated output type
 */
export function convertOutputMessageToNotebookFormat(
  msg: JupyterMessage<*, *>
) {
  return Object.assign({}, msg.content, {
    output_type: msg.header.msg_type
  });
}

/**
 * Convert raw jupyter messages that are output messages into nbformat style
 * outputs
 *
 * > o$ = iopub$.pipe(
 *     childOf(originalMessage),
 *     outputs()
 *   )
 */
export const outputs = () => (
  source: rxjs$Observable<JupyterMessage<*, *>>
): rxjs$Observable<JupyterMessage<*, *>> =>
  source.pipe(
    ofMessageType("execute_result", "display_data", "stream", "error"),
    map(convertOutputMessageToNotebookFormat)
  );

export const updatedOutputs = () => (
  source: rxjs$Observable<*>
): rxjs$Observable<*> =>
  source.pipe(
    ofMessageType("update_display_data"),
    map(msg => Object.assign({}, msg.content, { output_type: "display_data" }))
  );

/**
 * Get all the payload message content from an observable of jupyter messages
 *
 * > p$ = shell$.pipe(
 *     childOf(originalMessage),
 *     payloads()
 *   )
 */
export const payloads = () => (
  source: rxjs$Observable<JupyterMessage<*, *>>
): rxjs$Observable<JupyterMessage<*, *>> =>
  source.pipe(
    ofMessageType("execute_reply"),
    pluck("content", "payload"),
    filter(Boolean),
    mergeMap(p => from(p))
  );

/**
 * Get all the execution counts from an observable of jupyter messages
 */
export const executionCounts = () => (
  source: rxjs$Observable<JupyterMessage<*, *>>
): rxjs$Observable<JupyterMessage<*, *>> =>
  source.pipe(
    ofMessageType("execute_input"),
    pluck("content", "execution_count")
  );

export const executionStates = () => (
  source: rxjs$Observable<JupyterMessage<*, *>>
): rxjs$Observable<JupyterMessage<*, *>> =>
  source.pipe(ofMessageType("status"), pluck("content", "execution_state"));

export * from "./messages";
