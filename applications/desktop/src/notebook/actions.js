// @flow strict

import type { ContentRef } from "@nteract/core";

import * as actionTypes from "./actionTypes";
import type { DesktopNotebookClosingState } from "./state";

export function closeNotebook(payload: {
  contentRef: ContentRef,
  reloading: boolean
}): actionTypes.CloseNotebook {
  return {
    type: actionTypes.CLOSE_NOTEBOOK,
    payload
  };
}

export function closeNotebookProgress(payload: {
  newState: DesktopNotebookClosingState
}): actionTypes.CloseNotebookProgress {
  return {
    type: actionTypes.CLOSE_NOTEBOOK_PROGRESS,
    payload
  };
}
