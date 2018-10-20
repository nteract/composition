// @flow strict

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

export type ErrorType = "error";

export const ERROR = "error";

// In-memory version
export type ErrorOutput = {
  outputType: ErrorType,
  ename: string,
  evalue: string,
  traceback: Array<string>
};

// On disk
export type NbformatErrorOutput = {
  output_type: "error" | "pyerr",
  ename: string,
  evalue: string,
  traceback: Array<string>
};

type ErrorMessage = {
  header: {
    msg_type: "error" | "pyerr"
  },
  content: {
    ename: string,
    evalue: string,
    traceback: Array<string>
  }
};

export function errorOutput(
  eOut: $ReadOnly<{
    ename?: string,
    evalue?: string,
    traceback?: Array<string>
  }>
): ErrorOutput {
  return Object.freeze({
    outputType: ERROR,
    ename: eOut.ename || "",
    evalue: eOut.evalue || "",
    // Freeze a copy of the traceback array
    traceback: Array.isArray(eOut.traceback)
      ? Object.freeze(eOut.traceback.slice())
      : []
  });
}

errorOutput.type = ERROR;

errorOutput.fromNbformat = function fromNbformat(
  s: NbformatErrorOutput
): ErrorOutput {
  return errorOutput(s);
};

errorOutput.fromJupyterMessage = function fromJupyterMessage(
  msg: ErrorMessage
): ErrorOutput {
  return errorOutput(msg.content);
};
