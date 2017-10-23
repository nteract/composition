// @flow

import type { JupyterMessage, ExecuteRequest } from "./types";

import * as uuid from "uuid";

export function message(
  header: { msg_type: string, username: string, session: string },
  content: Object = {}
): JupyterMessage<*, *> {
  return {
    header: {
      msg_id: uuid.v4(),
      date: new Date(),
      version: "5.0",
      ...header
    },
    metadata: {},
    parent_header: {},
    content
  };
}

const defaultExecuteOptions = {
  silent: false,
  store_history: true,
  user_expressions: {},
  allow_stdin: false,
  stop_on_error: false
};

/**
 * An execute request creator
 *
 * > executeRequest({ username: 'kyle', session: '123' }, 'print("hey")', { 'allow_stdin': true })
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
  sessionInfo: { username: string, session: string },
  code: string = "",
  options: {
    silent: boolean,
    store_history: boolean,
    user_expressions: Object,
    allow_stdin: boolean,
    stop_on_error: boolean
  } = {
    silent: false,
    store_history: true,
    user_expressions: {},
    allow_stdin: false,
    stop_on_error: false
  }
): ExecuteRequest {
  const executeRequest = message({
    msg_type: "execute_request",
    ...sessionInfo
  });

  executeRequest.content = {
    code,
    ...defaultExecuteOptions,
    ...options
  };
  return executeRequest;
}
