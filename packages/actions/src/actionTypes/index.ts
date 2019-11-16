// Vendor modules
import {
  CellId,
  JSONObject,
  MediaBundle,
  OnDiskOutput
} from "@nteract/commutable";
import {
  ContentRef,
  HeaderDataProps,
  HostRef,
  KernelRef,
  PayloadMessage
} from "@nteract/types";
import { HostRecord } from "@nteract/types";
import { LanguageInfoMetadata } from "@nteract/types";
import { System as NotificationSystem } from "react-notification-system";

export * from "./bookstore";
export * from "./cells";
export * from "./contents";
export * from "./kernels";
export * from "./kernelspecs";

export const OVERWRITE_METADATA_FIELDS = "CORE/OVERWRITE_METADATA_FIELDS";
export interface OverwriteMetadataFields {
  type: "CORE/OVERWRITE_METADATA_FIELDS";
  payload: Partial<HeaderDataProps> & Partial<{ contentRef: ContentRef }>;
}

export interface ErrorAction<T extends string> {
  type: T;
  payload: Error;
  error: true;
}

export const OPEN_MODAL = "CORE/OPEN_MODAL";
export interface OpenModal {
  type: "CORE/OPEN_MODAL";
  payload: {
    modalType: string;
  };
}

export const CLOSE_MODAL = "CORE/CLOSE_MODAL";
export interface CloseModal {
  type: "CORE/CLOSE_MODAL";
}

export const ADD_HOST = "CORE/ADD_HOST";
export interface AddHost {
  type: "CORE/ADD_HOST";
  payload: { hostRef: HostRef; host: HostRecord };
}

export const REMOVE_HOST = "CORE/REMOVE_HOST";
export interface RemoveHost {
  type: "CORE/REMOVE_HOST";
  payload: { hostRef: HostRef };
}

export const SET_APP_HOST = "SET_APP_HOST";
export interface SetAppHostAction {
  type: "SET_APP_HOST";
  payload: HostRecord;
}

export const CHANGE_FILENAME = "CHANGE_FILENAME";
export interface ChangeFilenameAction {
  type: "CHANGE_FILENAME";
  payload: {
    filepath?: string;
    contentRef: ContentRef;
  };
}

export const APPEND_OUTPUT = "APPEND_OUTPUT";
export interface AppendOutput {
  type: "APPEND_OUTPUT";
  payload: {
    id: CellId;
    output: OnDiskOutput;
    contentRef: ContentRef;
  };
}

export const UPDATE_DISPLAY = "UPDATE_DISPLAY";
export interface UpdateDisplay {
  type: "UPDATE_DISPLAY";
  payload: {
    content: {
      output_type: "update_display_data";
      data: MediaBundle;
      metadata: JSONObject;
      transient: { display_id: string };
    };
    contentRef: ContentRef;
  };
}

export const UPDATE_DISPLAY_FAILED = "UPDATE_DISPLAY_FAILED";
export interface UpdateDisplayFailed {
  type: "UPDATE_DISPLAY_FAILED";
  payload: {
    error: Error;
    contentRef: ContentRef;
  };
  error: true;
}

export const ACCEPT_PAYLOAD_MESSAGE = "ACCEPT_PAYLOAD_MESSAGE";
export interface AcceptPayloadMessage {
  type: "ACCEPT_PAYLOAD_MESSAGE";
  payload: {
    id: CellId;
    payload: PayloadMessage;
    contentRef: ContentRef;
  };
}

export const SET_LANGUAGE_INFO = "SET_LANGUAGE_INFO";
export interface SetLanguageInfo {
  type: "SET_LANGUAGE_INFO";
  payload: {
    langInfo: LanguageInfoMetadata;
    kernelRef: KernelRef;
    contentRef: ContentRef;
  };
}

export const OVERWRITE_METADATA_FIELD = "OVERWRITE_METADATA_FIELD";
export interface OverwriteMetadataField {
  type: "OVERWRITE_METADATA_FIELD";
  payload: {
    field: string;
    value: any;
    contentRef: ContentRef;
  };
}

export const DELETE_METADATA_FIELD = "DELETE_METADATA_FIELD";
export interface DeleteMetadataField {
  type: "DELETE_METADATA_FIELD";
  payload: {
    field: string;
    contentRef: ContentRef;
  };
}

export const REGISTER_COMM_TARGET = "REGISTER_COMM_TARGET";
export interface RegisterCommTargetAction {
  type: "REGISTER_COMM_TARGET";
  name: string;
  handler: string;
}

export const COMM_OPEN = "COMM_OPEN";
export interface CommOpenAction {
  type: "COMM_OPEN";
  target_name: string;
  target_module: string;
  data: any;
  comm_id: string;
}

export const COMM_MESSAGE = "COMM_MESSAGE";
export interface CommMessageAction {
  type: "COMM_MESSAGE";
  data: any;
  comm_id: string;
}

export const TOGGLE_OUTPUT_EXPANSION = "TOGGLE_OUTPUT_EXPANSION";
export interface ToggleCellExpansion {
  type: "TOGGLE_OUTPUT_EXPANSION";
  payload: {
    id: CellId;
    contentRef: ContentRef;
  };
}

export const SET_EXECUTION_STATE = "SET_EXECUTION_STATE";
export interface SetExecutionStateAction {
  type: "SET_EXECUTION_STATE";
  payload: {
    kernelStatus: string;
    kernelRef: KernelRef;
  };
}

export const SET_NOTIFICATION_SYSTEM = "SET_NOTIFICATION_SYSTEM";
export interface SetNotificationSystemAction {
  type: "SET_NOTIFICATION_SYSTEM";
  payload: {
    notificationSystem: NotificationSystem;
  };
}

export const SET_GITHUB_TOKEN = "SET_GITHUB_TOKEN";
export interface SetGithubTokenAction {
  type: "SET_GITHUB_TOKEN";
  payload: {
    githubToken: string;
  };
}

export const PUBLISH_GIST = "CORE/PUBLISH_GIST";
export interface PublishGist {
  type: "CORE/PUBLISH_GIST";
  payload: {
    contentRef: ContentRef;
  };
}

export const ADD_TRANSFORM = "ADD_TRANSFORM";
export interface AddTransform {
  type: "ADD_TRANSFORM";
  payload: {
    mediaType: string;
    component: any;
  };
}

export const REMOVE_TRANSFORM = "REMOVE_TRANSFORM";
export interface RemoveTransform {
  type: "REMOVE_TRANSFORM";
  payload: {
    mediaType: string;
    component: any;
  };
}

export const ERROR = "CORE/ERROR";
export type CoreError = ErrorAction<"CORE/ERROR">;
