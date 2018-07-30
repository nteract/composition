// @flow

import produce from "immer";
import * as common from "../common";

/**
 * Let this declare the way for well typed records for outputs
 *
 * General organization is:
 *
 *   - Declare the in-memory type
 *   - Declare the nbformat type (exactly matching nbformat.v4.schema.json)
 *   - Create a "record maker", which we _don't_ export, followed by the real `makeXRecord` function that enforces set values
 *   - Write a way to go from nbformat to these records
 *   - Write a way to go from message spec to these records
 *
 */

export type ErrorType = "error" | "pyerr";

export const ERROR = "error";

// In-memory version
export type ErrorOutput = {
  outputType: ErrorType,
  ename: string,
  evalue: string,
  traceback: Iterable<string>
};

// On disk
export type NbformatErrorOutput = {
  output_type: ErrorType,
  ename: string,
  evalue: string,
  traceback: Iterable<string>
};

type ErrorMessage = {
  header: {
    msg_type: ErrorType
  },
  content: {
    ename: string,
    evalue: string,
    traceback: Iterable<string>
  }
};

export function makeErrorOutputRecord(errorOutput: ErrorOutput): ErrorOutput {
  const defaultErrorOutput = {
    outputType: ERROR,
    ename: "",
    evalue: "",
    traceback: []
  };

  return produce(defaultErrorOutput, draft => {
    return Object.assign(draft, defaultErrorOutput);
  });
}

export function errorRecordFromNbformat(s: NbformatErrorOutput): ErrorOutput {
  return makeErrorOutputRecord({
    outputType: s.output_type,
    ename: s.ename,
    evalue: s.evalue,
    traceback: s.traceback
  });
}

export function errorRecordFromMessage(msg: ErrorMessage): ErrorOutput {
  return makeErrorOutputRecord({
    outputType: ERROR,
    ename: msg.content.ename,
    evalue: msg.content.evalue,
    traceback: msg.content.traceback
  });
}
