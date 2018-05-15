// @flow

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
      console.log("file got it");
      console.log(action);
      return state;
    case actionTypes.UPDATE_FILE_TEXT:
      return updateFileText(state, action);
    default:
      (action: empty);
      return state;
  }
}
