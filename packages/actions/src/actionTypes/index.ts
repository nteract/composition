/**
 * @module actions
 */
import {
  CellId,
  MimeBundle,
  Output,
  JSONObject,
  ImmutableJSONType
} from "@nteract/commutable";

import { ContentRef, HostRef, KernelRef, PayloadMessage } from "@nteract/types";
import { HostRecord } from "@nteract/types";
import { LanguageInfoMetadata } from "@nteract/types";

import { System as NotificationSystem } from "react-notification-system";

export * from "./cells";
export * from "./contents";
export * from "./kernels";
export * from "./kernelspecs";

export type ErrorAction<T extends string> = {
  type: T;
  payload: Error;
  error: true;
};

export const OPEN_MODAL = "CORE/OPEN_MODAL";
export type OpenModal = {
  type: "CORE/OPEN_MODAL";
  payload: {
    modalType: string;
  };
};

export const CLOSE_MODAL = "CORE/CLOSE_MODAL";
export type CloseModal = {
  type: "CORE/CLOSE_MODAL";
};

export const ADD_HOST = "CORE/ADD_HOST";
export type AddHost = {
  type: "CORE/ADD_HOST";
  payload: { hostRef: HostRef; host: HostRecord };
};

export const CHANGE_FILENAME = "CHANGE_FILENAME";
export type ChangeFilenameAction = {
  type: "CHANGE_FILENAME";
  payload: {
    filepath?: string;
    contentRef: ContentRef;
  };
};

export const APPEND_OUTPUT = "APPEND_OUTPUT";
export type AppendOutput = {
  type: "APPEND_OUTPUT";
  payload: {
    id: CellId;
    output: Output;
    contentRef: ContentRef;
  };
};

export const UPDATE_DISPLAY = "UPDATE_DISPLAY";
export type UpdateDisplay = {
  type: "UPDATE_DISPLAY";
  payload: {
    content: {
      data: MimeBundle;
      metadata: JSONObject;
      transient: { display_id: string };
    };
    contentRef: ContentRef;
  };
};

export const UPDATE_DISPLAY_FAILED = "UPDATE_DISPLAY_FAILED";
export type UpdateDisplayFailed = {
  type: "UPDATE_DISPLAY_FAILED";
  payload: {
    error: Error;
    contentRef: ContentRef;
  };
  error: true;
};

export const ACCEPT_PAYLOAD_MESSAGE = "ACCEPT_PAYLOAD_MESSAGE";
export type AcceptPayloadMessage = {
  type: "ACCEPT_PAYLOAD_MESSAGE";
  payload: {
    id: CellId;
    payload: PayloadMessage;
    contentRef: ContentRef;
  };
};

export const SET_LANGUAGE_INFO = "SET_LANGUAGE_INFO";
export type SetLanguageInfo = {
  type: "SET_LANGUAGE_INFO";
  payload: {
    langInfo: LanguageInfoMetadata;
    kernelRef: KernelRef;
    contentRef: ContentRef;
  };
};

export const OVERWRITE_METADATA_FIELD = "OVERWRITE_METADATA_FIELD";
export type OverwriteMetadataField = {
  type: "OVERWRITE_METADATA_FIELD";
  payload: {
    field: string;
    value: any;
    contentRef: ContentRef;
  };
};

export const DELETE_METADATA_FIELD = "DELETE_METADATA_FIELD";
export type DeleteMetadataField = {
  type: "DELETE_METADATA_FIELD";
  payload: {
    field: string;
    contentRef: ContentRef;
  };
};

export const REGISTER_COMM_TARGET = "REGISTER_COMM_TARGET";
export type RegisterCommTargetAction = {
  type: "REGISTER_COMM_TARGET";
  name: string;
  handler: string;
};

export const COMM_OPEN = "COMM_OPEN";
export type CommOpenAction = {
  type: "COMM_OPEN";
  target_name: string;
  target_module: string;
  data: any;
  comm_id: string;
};

export const COMM_MESSAGE = "COMM_MESSAGE";
export type CommMessageAction = {
  type: "COMM_MESSAGE";
  data: any;
  comm_id: string;
};

export const SET_CONFIG_AT_KEY = "SET_CONFIG_AT_KEY";
export type SetConfigAction<T> = {
  type: "SET_CONFIG_AT_KEY";
  key: string;
  value: T;
};

export const MERGE_CONFIG = "MERGE_CONFIG";
export type MergeConfigAction = {
  type: "MERGE_CONFIG";
  config: Map<string, ImmutableJSONType>;
};

export const LOAD_CONFIG = "LOAD_CONFIG";
export type LoadConfigAction = { type: "LOAD_CONFIG" };

export const SAVE_CONFIG = "SAVE_CONFIG";
export type SaveConfigAction = { type: "SAVE_CONFIG" };

export const DONE_SAVING_CONFIG = "DONE_SAVING_CONFIG";
export type DoneSavingConfigAction = { type: "DONE_SAVING_CONFIG" };

export const TOGGLE_OUTPUT_EXPANSION = "TOGGLE_OUTPUT_EXPANSION";
export type ToggleCellExpansion = {
  type: "TOGGLE_OUTPUT_EXPANSION";
  payload: {
    id: CellId;
    contentRef: ContentRef;
  };
};

export const SET_EXECUTION_STATE = "SET_EXECUTION_STATE";
export type SetExecutionStateAction = {
  type: "SET_EXECUTION_STATE";
  payload: {
    kernelStatus: string;
    kernelRef: KernelRef;
  };
};

export const SET_NOTIFICATION_SYSTEM = "SET_NOTIFICATION_SYSTEM";
export type SetNotificationSystemAction = {
  type: "SET_NOTIFICATION_SYSTEM";
  notificationSystem: NotificationSystem;
};

export const SET_GITHUB_TOKEN = "SET_GITHUB_TOKEN";
export type SetGithubTokenAction = {
  type: "SET_GITHUB_TOKEN";
  githubToken: string;
};

export const PUBLISH_GIST = "CORE/PUBLISH_GIST";
export type PublishGist = {
  type: "CORE/PUBLISH_GIST";
  payload: {
    contentRef: ContentRef;
  };
};

export const ERROR = "CORE/ERROR";
export type CoreError = ErrorAction<"CORE/ERROR">;
