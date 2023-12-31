import { KernelStatus } from "@nteract/types";
import { v4 as uuid } from "uuid";
import {
  BasicOutputMessageContent,
  ExecuteRequest,
  JupyterMessage,
  JupyterMessageHeader,
  MessageType,
  UpdateDisplayData,
  UpdateDisplayDataContent
} from "./types";

export type Channel = "shell" | "iopub" | "stdin";

/**
 * Returns which channel, iopub or stdin or shell, to send a kernel message
 * through.
 *
 * @param messageType The message type to fetch a channel for
 *
 * @returns The channel to send a kernel message through
 */
function whichChannel(messageType?: MessageType): Channel {
  switch (messageType) {
    case "execute_request":
    case "inspect_request":
    case "kernel_info_request":
    case "complete_request":
    case "history_request":
    case "is_complete_request":
    case "comm_info_request":
    case "shutdown_request":
      return "shell";
    case "display_data":
    case "stream":
    case "update_display_data":
    case "execute_input":
    case "execute_result":
    case "error":
    case "status":
    case "clear_output":
      return "iopub";
    case "input_request":
    case "input_reply":
      return "stdin";
    default:
      // We fallthrough to handle the comm messages separately as well as
      // unknown message types
      break;
  }

  // NOTE: The Kernel listens for COMM messages on the Shell channel,
  //       and the Frontend listens for them on the IOPub channel.
  // HACK: Since nteract is only frontends at the moment, no kernels implemented
  //       we simply assume this is destined for a frontend. Revisit as needed.
  if (
    messageType === "comm_open" ||
    messageType === "comm_msg" ||
    messageType === "comm_close"
  ) {
    return "shell";
  }

  // Likely safe to assume the message goes on shell
  // the developer can override this otherwise
  return "shell";
}

/**
 * Returns a fully-formatted kernel message.
 *
 * @param header An object containing the message type and session information
 * @param content The message type-specific contents to send in the kernel message
 *
 * @returns The fully-formatted kernel message
 */
export function message<MT extends MessageType>(
  header: { msg_type: MT; username?: string; session?: string },
  content: object = {}
): JupyterMessage<MT> {
  const channel: Channel = whichChannel(header.msg_type);
  return {
    header: {
      msg_id: uuid(),
      date: new Date().toISOString(),
      version: "5.2",

      // These fields _should_ get overridden by those provided in `header`
      // We supply them as a fallback here
      username: header.username || "nteract",
      msg_type: header.msg_type,
      session: header.session || uuid()
    },
    metadata: {},
    parent_header: {},
    content,
    channel,
    buffers: []
  };
}

/**
 * Creates a header for a kernel message of a given type.
 *
 * @param msg_type The message type to create a header for
 *
 * @returns A complete header for the message
 */
function createHeader<MT extends MessageType>(
  msg_type: MT
): JupyterMessageHeader<MT> {
  return {
    msg_id: uuid(),
    date: new Date().toISOString(),
    version: "5.2",
    msg_type,

    // These fields get overridden by enchannel implementations, we supply them
    // as a fallback here
    username: "nteract",
    session: uuid()
  };
}

/**
 * An execute request creator
 *
 * ref: https://jupyter-client.readthedocs.io/en/stable/messaging.html#execute
 * > executeRequest('print("hey")', { 'silent': true })
 * { header:
 *    { msg_id: 'f344cc6b-4308-4405-a8e8-a166b0345579',
 *      date: 2017-10-23T22:33:39.970Z,
 *      version: '5.0',
 *      msg_type: 'execute_request',
 *      username: 'kyle',
 *      session: '123' },
 *   metadata: {},
 *   parent_header: {},
 *   content:
 *    { code: 'print("hey")',
 *      silent: false,
 *      store_history: true,
 *      user_expressions: {},
 *      allow_stdin: true,
 *      stop_on_error: true } }
 *
 * @param code The code to execute
 * @param options The options for the execute request
 *
 * @returns A complete execute_request message
 */
export function executeRequest(
  code: string = "",
  options: {
    silent?: boolean;
    store_history?: boolean;
    user_expressions?: object;
    allow_stdin?: boolean;
    stop_on_error?: boolean;
  } = {}
): ExecuteRequest {
  const channel: Channel = whichChannel("execute_request");

  return {
    header: createHeader("execute_request"),
    metadata: {},
    parent_header: {},
    content: {
      code,
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: true,
      stop_on_error: true,
      ...options
    },
    channel,
    buffers: []
  };
}

////// OUTPUT MESSAGE TYPES //////

/**
 * Creates a display_data message.
 *
 * ref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#display-data
 * > displayData({username: 'rgbkrk', session: '123'}, {data: {'text/html': '<b>sup</b>'}}, "display_data")
 * { header:
 *    { msg_id: '24e95ce7-73d5-4c5f-9ef0-ff8547779690',
 *      date: 2017-10-23T22:57:58.704Z,
 *      version: '5.1',
 *      msg_type: 'display_data',
 *      username: 'rgbkrk',
 *      session: '123' },
 *   metadata: {},
 *   parent_header: {},
 *   content:
 *    { data: { 'text/html': '<b>sup</b>' },
 *      metadata: {},
 *      transient: {} } }
 */

// Overload 1: with second parameter
export function displayData<
  C extends BasicOutputMessageContent,
  T extends MessageType
>(content: C, msg_type: T): JupyterMessage<T, C>;

// Overload 2: without second parameter (required to get TS to behave)
export function displayData<C extends BasicOutputMessageContent>(
  content: C,
  msg_type?: undefined
): JupyterMessage<"display_data", C>;

// The actual displayData function; generics should infer correctly, based on
// the overloads above.
export function displayData(
  content: BasicOutputMessageContent,
  msg_type?: MessageType
): JupyterMessage {
  if (msg_type === undefined) {
    msg_type = "display_data";
  }

  return message(
    {
      msg_type
    },
    {
      data: {},
      metadata: {},
      transient: {},
      ...content
    }
  );
}

/**
 * Creates an update_display_data message.
 *
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#update-display-data
 */
export function updateDisplayData(
  content: UpdateDisplayDataContent
): UpdateDisplayData {
  // TODO: Enforce the transient display_id here?
  return displayData(content, "update_display_data");
}

/**
 * Creates a message containing information about the result of an execution.
 *
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#id6
 */
export function executeResult(content: {
  execution_count: number;
  data?: object;
  metadata?: object;
  transient?: object;
}) {
  // TODO: Enforce the transient display_id here?
  const m = displayData(content, "execute_result");
  m.content.execution_count = content.execution_count;
  return m;
}

/**
 * Creates an error message to indicate when an exception has occurred during
 * code execution.
 *
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#execution-errors
 */

export interface ExecuteError {
  ename?: string;
  evalue?: string;
  traceback?: string[];
}

export function error(content: ExecuteError) {
  return message(
    {
      msg_type: "error"
    },
    {
      ename: "",
      evalue: "",
      traceback: [],
      ...content
    }
  );
}

/**
 * Creates a stream message.
 *
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#streams-stdout-stderr-etc
 *
 * @param content The message type and its contents.
 */
export function stream(content: { name: "stdout" | "stderr"; text: string }) {
  return message(
    {
      msg_type: "stream"
    },
    content
  );
}

///// EXECUTE_REPLY /////

/**
 * Creates a message containing the response from a kernel execute request.
 *
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#execution-results
 */


export interface ExecuteReplyError {
  status: string;
  execution_count: number;
  ename: string;
  evalue: string;
  traceback: string[];
}
export interface ExecuteReplyOk {
  status: string;
  execution_count: number;
  payload?: object[];
  user_expressions?: object;

}
export function executeReply(
  content: ExecuteReplyOk | ExecuteReplyError
) {
  return message(
    {
      msg_type: "execute_reply"
    },
    content
  );
}

/**
 * Creates a status message published by the kernel to indicate its state.
 *
 * @param execution_state The kernel's execution state
 */
export function status(execution_state: KernelStatus.Busy | KernelStatus.Idle | KernelStatus.Starting) {
  return message(
    {
      msg_type: "status"
    },
    {
      execution_state
    }
  );
}

/**
 *
 * @param content
 */
export function clearOutput(content?: { wait: boolean }) {
  return message(
    {
      msg_type: "clear_output"
    },
    content
  );
}

/**
 *
 * @param content
 */
export function executeInput(content: {
  code: string;
  execution_count: number;
}) {
  return message(
    {
      msg_type: "execute_input"
    },
    content
  );
}

/**
 * Creates a message to request information about a kernel.
 *
 * @returns A kernel_info_request message
 */
export function kernelInfoRequest() {
  return message({ msg_type: "kernel_info_request" });
}

/**
 * Creates a message to request the shutdown of a kernel.
 *
 * @param content An options object containing whether or not to restart the kernel
 *
 * @returns A shutdown_request message
 */
export function shutdownRequest(
  content: { restart?: boolean } = { restart: false }
): JupyterMessage<"shutdown_request", { restart?: boolean }> {
  return message({ msg_type: "shutdown_request" }, content);
}

export function inputReply(content: {
  value: string;
}): JupyterMessage<"input_reply"> {
  return message({ msg_type: "input_reply" }, content);
}
