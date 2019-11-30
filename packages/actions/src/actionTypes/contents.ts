import { ContentRef, KernelRef, KernelspecInfo } from "@nteract/types";

export const TOGGLE_HEADER_EDITOR = "CORE/TOGGLE_HEADER_EDITOR";
export interface ToggleHeaderEditor {
  type: "CORE/TOGGLE_HEADER_EDITOR";
  payload: {
    contentRef: ContentRef;
  };
}

export const CHANGE_CONTENT_NAME = "CORE/CHANGE_CONTENT_NAME";
export interface ChangeContentName {
  type: "CORE/CHANGE_CONTENT_NAME";
  payload: {
    contentRef: ContentRef;
    filepath: string;
    prevFilePath: string;
  };
}

export const CHANGE_CONTENT_NAME_FULFILLED =
  "CORE/CHANGE_CONTENT_NAME_FULFILLED";
export interface ChangeContentNameFulfilled {
  type: "CORE/CHANGE_CONTENT_NAME_FULFILLED";
  payload: {
    contentRef: ContentRef;
    filepath: string;
    prevFilePath: string;
  };
}

export const CHANGE_CONTENT_NAME_FAILED = "CORE/CHANGE_CONTENT_NAME_FAILED";
export interface ChangeContentNameFailed {
  type: "CORE/CHANGE_CONTENT_NAME_FAILED";
  payload: {
    basepath: string;
    contentRef: ContentRef;
    error: Error;
    filepath: string;
    prevFilePath: string;
  };
}

export const FETCH_CONTENT = "CORE/FETCH_CONTENT";
export interface FetchContent {
  type: "CORE/FETCH_CONTENT";
  payload: {
    filepath: string;
    params: object;
    kernelRef: KernelRef;
    contentRef: ContentRef;
  };
}

export const FETCH_CONTENT_FULFILLED = "CORE/FETCH_CONTENT_FULFILLED";
export interface FetchContentFulfilled {
  type: "CORE/FETCH_CONTENT_FULFILLED";
  payload: {
    filepath: string;
    model: any; // literal response from API
    kernelRef: KernelRef;
    contentRef: ContentRef;
    created?: Date | null;
    lastSaved?: Date | null;
  };
}

export const FETCH_CONTENT_FAILED = "CORE/FETCH_CONTENT_FAILED";
export interface FetchContentFailed {
  type: "CORE/FETCH_CONTENT_FAILED";
  payload: {
    filepath: string;
    error: Error;
    kernelRef: KernelRef;
    contentRef: ContentRef;
  };
  error: true;
}

export const DOWNLOAD_CONTENT = "CORE/DOWNLOAD_CONTENT";
export interface DownloadContent {
  type: "CORE/DOWNLOAD_CONTENT";
  payload: {
    contentRef: ContentRef;
  };
}

export const DOWNLOAD_CONTENT_FAILED = "CORE/DOWNLOAD_CONTENT_FAILED";
export interface DownloadContentFailed {
  type: "CORE/DOWNLOAD_CONTENT_FAILED";
  payload: { contentRef: ContentRef };
}

export const DOWNLOAD_CONTENT_FULFILLED = "CORE/DOWNLOAD_CONTENT_FULFILLED";
export interface DownloadContentFulfilled {
  type: "CORE/DOWNLOAD_CONTENT_FULFILLED";
  payload: { contentRef: ContentRef };
}

export const SAVE = "SAVE";
export interface Save {
  type: "SAVE";
  payload: {
    contentRef: ContentRef;
  };
}

export const SAVE_AS = "SAVE_AS";
export interface SaveAs {
  type: "SAVE_AS";
  payload: {
    filepath: string;
    contentRef: ContentRef;
  };
}

export const SAVE_FAILED = "SAVE_FAILED";
export interface SaveFailed {
  type: "SAVE_FAILED";
  payload: {
    contentRef: ContentRef;
    error: Error;
  };
  error: true;
}

export const SAVE_FULFILLED = "SAVE_FULFILLED";
export interface SaveFulfilled {
  type: "SAVE_FULFILLED";
  payload: {
    contentRef: ContentRef;
    // Literal response from contents API, for use with
    model: any;
  };
}

export const SAVE_AS_FAILED = "SAVE_AS_FAILED";
export interface SaveAsFailed {
  type: "SAVE_AS_FAILED";
  payload: {
    contentRef: ContentRef;
    error: Error;
  };
  error: true;
}

export const SAVE_AS_FULFILLED = "SAVE_AS_FULFILLED";
export interface SaveAsFulfilled {
  type: "SAVE_AS_FULFILLED";
  payload: {
    contentRef: ContentRef;
    model: any;
  };
}

export const NEW_NOTEBOOK = "NEW_NOTEBOOK";
export interface NewNotebook {
  type: "NEW_NOTEBOOK";
  payload: {
    filepath: string | null;
    cwd: string;
    kernelSpec: KernelspecInfo | null;
    kernelRef: KernelRef;
    contentRef: ContentRef;
  };
}

export const UPDATE_FILE_TEXT = "UPDATE_FILE_TEXT";
export interface UpdateFileText {
  type: "UPDATE_FILE_TEXT";
  payload: {
    text: string;
    contentRef: ContentRef;
  };
}

export const CLOSE_NOTEBOOK = "CLOSE_NOTEBOOK";
export interface CloseNotebook {
  type: "CLOSE_NOTEBOOK";
  payload: {
    contentRef: ContentRef;
  };
}

export const DISPOSE_CONTENT = "DISPOSE_CONTENT";
export interface DisposeContent {
  type: "DISPOSE_CONTENT";
  payload: {
    contentRef: ContentRef;
  }
}

