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

type DisplayDataType = "display_data";

export const DISPLAYDATA = "display_data";
export const outputType = DISPLAYDATA;

// In-memory version
export type DisplayDataOutput = {
  outputType: DisplayDataType,
  data: common.MediaBundle,
  metadata: {}
};

// On disk
export type NbformatDisplayDataOutput = {
  output_type: DisplayDataType,
  data: common.OnDiskMimebundle,
  metadata: {}
};

type DisplayDataMessage = {
  header: {
    msg_type: DisplayDataType
  },
  content: {
    data: common.MimeBundle,
    metadata: {}
  }
};

export function displayData(displayDataOutput?: {
  data?: common.MimeBundle,
  metadata?: {}
}): DisplayDataOutput {
  const defaultDisplayData = {
    outputType: DISPLAYDATA,
    data: {},
    metadata: {}
  };

  return produce(defaultDisplayData, draft => {
    return Object.assign(draft, displayDataOutput);
  });
}

displayData.type = "display_data";

displayData.fromNbformat = function fromNbformat(
  s: NbformatDisplayDataOutput
): DisplayDataOutput {
  return displayData({
    outputType: s.output_type,
    data: common.createImmutableMimeBundle(s.data),
    metadata: s.metadata
  });
};

displayData.fromJupyterMessage = function displayDataRecordFromMessage(
  msg: DisplayDataMessage
): DisplayDataOutput {
  return displayData({
    outputType: DISPLAYDATA,
    // The data field in a display data output type on the message spec is the same as we need
    // We could do additional checking here though
    data: msg.content.data,
    metadata: msg.content.metadata
  });
};
