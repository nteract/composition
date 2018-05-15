// @flow

import * as React from "react";
import * as uuid from "uuid";

import * as actionTypes from "../../../../actionTypes";

import * as Immutable from "immutable";

import { has } from "lodash";

import type { FileModelRecord } from "../../../../state/entities/contents";

function updateFileText(
  state: FileModelRecord,
  action: actionTypes.UpdateFileText
) {
  return state.set("text", action.payload.text);
}

type FileAction =
  | actionTypes.UpdateFileText
  | actionTypes.BufferedJupyterMessages;

export function file(state: FileModelRecord, action: FileAction) {
  switch (action.type) {
    case actionTypes.BUFFERED_JUPYTER_MESSAGES:
      const { messages } = action.payload;

      return state.updateIn(["outputs"], outputs =>
        outputs.push(
          messages.map((msg: JupyterMessage<*, *>) => {
            return (
              <div key={msg.header.msg_id}>
                <h3
                  style={{
                    backgroundColor: "#7caeff",
                    padding: "6px"
                  }}
                >
                  {msg.header.msg_type}
                </h3>
                <pre>{JSON.stringify(msg.content, null, 2)}</pre>
              </div>
            );
          })
        )
      );
    case actionTypes.UPDATE_FILE_TEXT:
      return updateFileText(state, action);
    default:
      (action: empty);
      return state;
  }
}
