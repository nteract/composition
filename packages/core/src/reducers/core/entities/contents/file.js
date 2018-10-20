// @flow

import * as actionTypes from "../../../../actionTypes";

import type { FileModelRecord } from "../../../../state/entities/contents";

function updateFileText(
  state: FileModelRecord,
  action: actionTypes.UpdateFileText
) {
  return state.set("text", action.payload.text);
}

type FileAction = actionTypes.UpdateFileText;

export function file(state: FileModelRecord, action: FileAction) {
  switch (action.type) {
    case actionTypes.UPDATE_FILE_TEXT:
      return updateFileText(state, action);
    default:
      (action: empty);
      return state;
  }
}
