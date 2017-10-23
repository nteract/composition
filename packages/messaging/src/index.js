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

import * as uuid from "uuid";

export const session = uuid.v4();

export function getUsername() {
  return (
    process.env.LOGNAME ||
    process.env.USER ||
    process.env.LNAME ||
    process.env.USERNAME
  );
}

export type JupyterMessageHeader<MT> = {
  msg_id: string,
  username: string,
  date: string, // ISO 8601 timestamp
  msg_type: MT, // this could be an enum
  version: string // this could be an enum
};

export type JupyterMessage<MT, C> = {
  header: JupyterMessageHeader<MT>,
  parent_header: JupyterMessageHeader<*>,
  metadata: Object,
  content: C,
  buffers?: Array<any> | null
};

export type ExecuteMessageContent = {
  code: string,
  silent: boolean,
  store_history: boolean,
  user_expressions: Object,
  allow_stdin: boolean,
  stop_on_error: boolean
};

export type ExecuteMessage = JupyterMessage<
  "execute_request",
  ExecuteMessageContent
>;

export function createMessage(
  msg_type: string,
  fields: Object = {}
): JupyterMessage<*, *> {
  const username = getUsername();
  return Object.assign(
    {
      header: {
        username,
        session,
        msg_type,
        msg_id: uuid.v4(),
        date: new Date(),
        version: "5.0"
      },
      metadata: {},
      parent_header: {},
      content: {}
    },
    fields
  );
}

/**
 * Initializes an execute message with defaults
 *
 * @param {String} code - Code to be executed in a message to the kernel.
 * @return {Object} msg - Message object containing the code to be sent.
 */
export function createExecuteRequest(code: string = ""): ExecuteMessage {
  const executeRequest = createMessage("execute_request");
  executeRequest.content = {
    code,
    silent: false,
    store_history: true,
    user_expressions: {},
    allow_stdin: false,
    stop_on_error: false
  };
  return executeRequest;
}

/**
 * operator for getting all messages that declare their parent header as
 * parentMessage's header
 */
export const childOf = (parentMessage: JupyterMessage<*, *>) => (
  source: rxjs$Observable<*>
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

  return (source: rxjs$Observable<*>): rxjs$Observable<*> =>
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
export function convertOutputMessageToNotebookFormat(msg: any) {
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
export const outputs = () => (source: rxjs$Observable<*>): rxjs$Observable<*> =>
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
  source: rxjs$Observable<*>
): rxjs$Observable<*> =>
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
  source: rxjs$Observable<*>
): rxjs$Observable<*> =>
  source.pipe(
    ofMessageType("execute_input"),
    pluck("content", "execution_count")
  );

export const executionStates = () => (
  source: rxjs$Observable<*>
): rxjs$Observable<*> =>
  source.pipe(ofMessageType("status"), pluck("content", "execution_state"));
