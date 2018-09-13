// @flow
/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

import { Observable, of, from, merge, throwError } from "rxjs";

import {
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

export type { JupyterMessage, ExecuteRequest, JupyterMessageHeader };

// TODO: Deprecate
export function createMessage<MT: string>(
  msg_type: MT,
  fields: Object = {}
): JupyterMessage<MT, *> {
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
        // strictly speaking, in order for the message to be a child of the parent
        // message, it has to both be a message and have a parent to begin with
        if (!msg || !msg.parent_header || !msg.parent_header.msg_id) {
          if (process.env.DEBUG === "true") {
            console.warn("no parent_header.msg_id on message", msg);
          }
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
    map(
      entry =>
        entry.content || entry.content.payload ? entry.content.payload : null
    ),
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
    map(entry => entry.content.execution_count)
  );

export const kernelStatuses = () => (
  source: rxjs$Observable<JupyterMessage<*, *>>
): rxjs$Observable<JupyterMessage<*, *>> =>
  source.pipe(
    ofMessageType("status"),
    map(entry => entry.content.execution_state)
  );

export * from "./messages";
