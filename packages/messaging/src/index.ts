import { PayloadMessage } from "@nteract/types";
import { from, Observable, Subscriber } from "rxjs";
import { filter, map, mergeMap } from "rxjs/operators";
import { message } from "./messages";
import { JupyterMessage, MessageType } from "./types";

export * from "./types";

export interface CreateMessageFields extends Partial<JupyterMessage> {
  header?: never;
}

// TODO: Deprecate
export function createMessage<MT extends MessageType>(
  msg_type: MT,
  fields: CreateMessageFields = {}
): JupyterMessage<MT> {
  return { ...message({ msg_type }), ...fields };
}

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
  buffers: []
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
 * operator for getting all messages that declare their parent header as
 * parentMessage's header.
 *
 * @param parentMessage The parent message whose children we should fetch
 *
 * @returns A function that takes an Observable of kernel messages and returns
 * messages that are children of parentMessage.
 */
export function childOf(
  parentMessage: JupyterMessage
): (source: Observable<JupyterMessage<MessageType, any>>) => any {
  return (source: Observable<JupyterMessage>) => {
    const parentMessageID: string = parentMessage.header.msg_id;
    return Observable.create((subscriber: Subscriber<JupyterMessage>) =>
      source.subscribe(
        msg => {
          // strictly speaking, in order for the message to be a child of the
          // parent message, it has to both be a message and have a parent to
          // begin with
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
}

/**
 * operator for getting all messages with the given comm id
 *
 * @param comm_id The comm id that we are filtering by
 *
 * @returns A function that takes an Observable of kernel messages and returns
 * messages that have the given comm id
 */
export function withCommId(
  comm_id: string
): (source: Observable<JupyterMessage<MessageType, any>>) => any {
  return (source: Observable<JupyterMessage>) => {
    return Observable.create((subscriber: Subscriber<JupyterMessage>) =>
      source.subscribe(
        msg => {
          if (msg && msg.content && msg.content.comm_id === comm_id) {
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
}

/**
 * ofMessageType is an Rx Operator that filters on msg.header.msg_type
 * being one of messageTypes.
 *
 * @param messageTypes The message types to filter on
 *
 * @returns An Observable containing only messages of the specified types
 */
export const ofMessageType = <T extends MessageType>(
  ...messageTypes: Array<T | [T]>
): ((source: Observable<JupyterMessage>) => Observable<JupyterMessage<T>>) => {
  // Switch to the splat mode
  if (messageTypes.length === 1 && Array.isArray(messageTypes[0])) {
    return ofMessageType(...messageTypes[0]);
  }

  return (source: Observable<JupyterMessage>) =>
    Observable.create((subscriber: Subscriber<JupyterMessage>) =>
      source.subscribe(
        msg => {
          if (!msg.header || !msg.header.msg_type) {
            subscriber.error(new Error("no header.msg_type on message"));
            return;
          }

          if (messageTypes.includes(msg.header.msg_type as any)) {
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
 * @param msg Message that has content which can be converted to nbformat
 *
 * @returns Message with the associated output type
 */
export function convertOutputMessageToNotebookFormat(msg: JupyterMessage) {
  return {
    ...msg.content,
    output_type: msg.header.msg_type
  };
}

/**
 * Convert raw Jupyter messages that are output messages into nbformat style
 * outputs
 *
 * > o$ = iopub$.pipe(
 *     childOf(originalMessage),
 *     outputs()
 *   )
 */
export const outputs = () => (source: Observable<JupyterMessage>) =>
  source.pipe(
    ofMessageType("execute_result", "display_data", "stream", "error"),
    map(convertOutputMessageToNotebookFormat)
  );

/**
 * Get all messages for updating a display output.
 */
export const updatedOutputs = () => (source: Observable<JupyterMessage>) =>
  source.pipe(
    ofMessageType("update_display_data"),
    map(msg => ({ ...msg.content, output_type: "display_data" }))
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
  source: Observable<JupyterMessage>
): Observable<PayloadMessage> =>
  source.pipe(
    ofMessageType("execute_reply"),
    map(entry => entry.content.payload),
    filter(p => !!p),
    mergeMap((p: Observable<PayloadMessage>) => from(p))
  );

/**
 * Get all the execution counts from an observable of jupyter messages
 */
export const executionCounts = () => (source: Observable<JupyterMessage>) =>
  source.pipe(
    ofMessageType("execute_input", "execute_reply"),
    map(entry => entry.content.execution_count)
  );

/**
 * Get all the execution status from the observable of the jupyter messages
 * One of: 'ok' OR 'error' OR 'aborted' from the messaging protocol: https://jupyter-client.readthedocs.io/en/stable/messaging.html#execution-results
 */
export const executionStatuses = () => (source: Observable<JupyterMessage>) =>
source.pipe(
  ofMessageType("execute_reply"),
  map(entry => entry.content.status)
);

/**
 * Get all execution errors from the observable of the jupyter messages
 */
export const executionErrors = () => (source: Observable<JupyterMessage>) =>
source.pipe(
  ofMessageType("execute_reply"),
  filter((entry) => entry.content.status !== "ok"),
  map(entry => entry.content)
);

/**
 * Get all statuses of all running kernels.
 */
export const kernelStatuses = () => (source: Observable<JupyterMessage>) =>
  source.pipe(
    ofMessageType("status"),
    map(entry => entry.content.execution_state)
  );

export const inputRequests = () => (source: Observable<JupyterMessage>) =>
  source.pipe(
    ofMessageType("input_request"),
    map(entry => entry.content)
  );

export * from "./messages";

import { encode, decode } from "./wire-protocol";

export const wireProtocol = { encode, decode };
