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

export type DisplayDataType = "display_data";

export const DISPLAYDATA = "display_data";

export type MetaData = {
  collapsed?: boolean,
  autoscroll?: boolean | "auto",
  deletable?: boolean,
  format?: string,
  name?: string,
  tags?: Array<string>,
  source_hidden?: boolean,
  outputs_hidden?: boolean,
  isolated?: boolean
};

// In-memory version
export type DisplayDataOutput = {
  outputType: DisplayDataType,
  data: common.MimeBundle,
  metadata: MetaData
};

// On disk
export type NbformatDisplayDataOutput = {
  output_type: DisplayDataType,
  data: common.MimeBundle,
  metadata: MetaData
};

type DisplayDataMessage = {
  header: {
    msg_type: DisplayDataType
  },
  content: {
    data: common.MimeBundle,
    metadata: MetaData
  }
};

// NOTE: No export, as the values here should get overridden by an exact version
//       passed into makeDisplayDataOutputRecord

export function makeDisplayDataOutputRecord(
  displayDataOutput: DisplayDataOutput
): DisplayDataOutput {
  const defaultDisplayDataRecord = {
    outputType: DISPLAYDATA,
    data: {},
    metadata: {}
  };

  return produce(defaultDisplayDataRecord, draft => {
    return Object.assign(draft, displayDataOutput);
  });
}

export function displayDataRecordFromNbformat(
  s: NbformatDisplayDataOutput
): DisplayDataOutput {
  return makeDisplayDataOutputRecord({
    outputType: s.output_type,
    data: common.createImmutableMimeBundle(s.data),
    metadata: s.metadata
  });
}

export function displayDataRecordFromMessage(
  msg: DisplayDataMessage
): DisplayDataOutput {
  return makeDisplayDataOutputRecord({
    outputType: DISPLAYDATA,
    data: msg.content.data,
    metadata: msg.content.metadata
  });
}
