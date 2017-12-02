// @flow

import type {
  JupyterMessage,
  ExecuteRequest,
  JupyterMessageHeader
} from "./types";

import * as uuid from "uuid";

type SessionInfo = { username: string, session: string };

function whichChannel(messageType?: string) {
  switch (messageType) {
    case "execute_request":
    case "inspect_request":
    case "kernel_info_request":
    case "complete_request":
    case "history_request":
    case "is_complete_request":
    case "comm_info_request":
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

export function message(
  header: { msg_type?: string, username?: string, session?: string } = {},
  content?: Object = {}
): JupyterMessage<*, *> {
  const channel = whichChannel(header.msg_type);

  return {
    header: {
      msg_id: uuid.v4(),
      date: new Date().toISOString(),
      version: "5.2",

      // These fields _should_ get overridden by those provided in `header`
      // We supply them as a fallback here
      username: "nteract",
      msg_type: "__OVERWRITE_THE_MESSAGE_TYPE__",
      session: uuid.v4(),

      ...header
    },
    metadata: {},
    parent_header: {},
    content,
    channel,
    buffers: []
  };
}

/**
 * An execute request creator
 *
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
 *      stop_on_error: false } }
 *
 */
export function executeRequest(
  code: string = "",
  options?: {
    silent?: boolean,
    store_history?: boolean,
    user_expressions?: Object,
    allow_stdin?: boolean,
    stop_on_error?: boolean
  },
  sessionInfo?: SessionInfo
): ExecuteRequest {
  return message(
    // Header
    {
      msg_type: "execute_request",
      ...sessionInfo
    },
    // Content
    {
      code,
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: false,
      stop_on_error: false,
      ...options
    }
  );
}

////// OUTPUT MESSAGE TYPES //////

/**
 * create a display_data message
 *
 * ref: http://jupyter-client.readthedocs.io/en/stable/messaging.html#display-data
 * > displayData({username: 'rgbkrk', session: '123'}, {data: {'text/html': '<b>sup</b>'}})
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
export function displayData(
  content: {
    data?: Object,
    metadata?: Object,
    transient?: Object
  },
  sessionInfo?: SessionInfo
) {
  return message(
    {
      msg_type: "display_data",
      ...sessionInfo
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
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#update-display-data
 */
export function updateDisplayData(
  content: {
    data?: Object,
    metadata?: Object,
    transient?: Object
  },
  sessionInfo?: SessionInfo
) {
  // TODO: Enforce the transient display_id here?
  const m = displayData(content, sessionInfo);
  m.header.msg_type = "update_display_data";
  return m;
}

/**
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#id6
 */
export function executeResult(
  content: {
    execution_count: number,
    data?: Object,
    metadata?: Object,
    transient?: Object
  },
  sessionInfo?: SessionInfo
) {
  // TODO: Enforce the transient display_id here?
  const m = displayData(content, sessionInfo);
  m.header.msg_type = "execute_result";
  m.content.execution_count = content.execution_count;
  return m;
}

/**
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#execution-errors
 */
export function error(
  content: {
    ename?: string,
    evalue?: string,
    traceback?: Array<string>
  },
  sessionInfo?: SessionInfo
) {
  return message(
    {
      msg_type: "error",
      ...sessionInfo
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
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#streams-stdout-stderr-etc
 */
export function stream(
  content: {
    name: "stdout" | "stderr",
    text: string
  },
  sessionInfo?: SessionInfo
) {
  return message(
    {
      msg_type: "stream",
      ...sessionInfo
    },
    content
  );
}

///// EXECUTE_REPLY /////

/**
 * http://jupyter-client.readthedocs.io/en/stable/messaging.html#execution-results
 */
export function executeReply(content: Object, sessionInfo?: SessionInfo) {
  // TODO: This function could be better typed. It's a bit dual headed though since:
  //         * `status: ok` carries payloads
  //         * `status: error` carries error info that is also in error output
  return message(
    {
      msg_type: "execute_reply",
      ...sessionInfo
    },
    content
  );
}

export function status(
  execution_state: "busy" | "idle" | "starting",
  sessionInfo?: SessionInfo
) {
  return message(
    {
      msg_type: "status",
      ...sessionInfo
    },
    {
      execution_state
    }
  );
}

export function clearOutput(
  content?: { wait: boolean },
  sessionInfo?: SessionInfo
) {
  return message(
    {
      msg_type: "clear_output",
      ...sessionInfo
    },
    content
  );
}

export function executeInput(
  content: { code: string, execution_count: number },
  sessionInfo?: SessionInfo
) {
  return message(
    {
      msg_type: "execute_input",
      ...sessionInfo
    },
    content
  );
}

export function kernelInfoRequest(sessionInfo?: SessionInfo) {
  return message({ msg_type: "kernel_info_request", ...sessionInfo });
}
