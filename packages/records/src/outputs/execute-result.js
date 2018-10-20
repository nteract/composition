// @flow strict

import produce from "immer";
import * as common from "../common";

/**
 * Let this declare the way for well typed records for outputs
 *
 * General organization is:
 *
 *   - Declare the in-memory type
 *   - Declare the nbformat type (exactly matching nbformat.v4.schema.json)
 *   - Declare the message type (matching http://jupyter-client.readthedocs.io/en/stable/messaging.html)
 *   - Write a way to go from nbformat to our in-memory version
 *   - Write a way to go from message spec to our in-memory version
 *
 */

type ExecuteResultType = "execute_result";
export type ExecutionCount = ?number;

export const EXECUTE_RESULT = "execute_result";

// In-memory version
export type ExecuteResultOutput = {
  outputType: ExecuteResultType,
  executionCount: ExecutionCount,
  data: common.MimeBundle,
  metadata: {}
};

// On disk
export type NbformatExecuteResult = {
  output_type: ExecuteResultType,
  execution_count: ExecutionCount,
  data: common.OnDiskMimebundle,
  metadata: {}
};

type ExecuteResultMessage = {
  header: {
    msg_type: ExecuteResultType
  },
  content: {
    execution_count: number,
    data: common.MimeBundle,
    metadata: {}
  }
};

export function executeResult(
  executeResultOutput?: $ReadOnly<{
    executionCount?: ExecutionCount,
    data?: common.MimeBundle,
    metadata?: {}
  }>
): ExecuteResultOutput {
  const defaultExecuteResult = {
    outputType: EXECUTE_RESULT,
    executionCount: undefined,
    data: {},
    metadata: {}
  };
  return produce(defaultExecuteResult, draft => {
    return Object.assign(draft, executeResultOutput);
  });
}

executeResult.type = EXECUTE_RESULT;

executeResult.fromNbformat = function fromNbformat(
  s: NbformatExecuteResult
): ExecuteResultOutput {
  return executeResult({
    executionCount: s.execution_count,
    data: common.createImmutableMimeBundle(s.data),
    metadata: s.metadata
  });
};

executeResult.fromJupyterMessage = function fromJupyterMessage(
  msg: ExecuteResultMessage
): ExecuteResultOutput {
  return executeResult({
    executionCount: msg.content.execution_count,
    data: msg.content.data,
    metadata: msg.content.metadata
  });
};
