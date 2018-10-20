// @flow strict

import type { ContentRef } from "@nteract/core";

import type { DesktopNotebookClosingState } from "./state";

export const CLOSE_NOTEBOOK = "DESKTOP/CLOSE_NOTEBOOK";
export type CloseNotebook = {
  type: "DESKTOP/CLOSE_NOTEBOOK",
  payload: {
    contentRef: ContentRef,
    reloading: boolean
  }
};

export const CLOSE_NOTEBOOK_PROGRESS = "DESKTOP/CLOSE_NOTEBOOK_PROGRESS";
export type CloseNotebookProgress = {
  type: "DESKTOP/CLOSE_NOTEBOOK_PROGRESS",
  payload: {
    newState: DesktopNotebookClosingState
  }
};
