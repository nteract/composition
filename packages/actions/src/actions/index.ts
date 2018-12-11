/**
 * @module actions
 */
import { CellId, MimeBundle, Output, JSONObject } from "@nteract/commutable";

import * as actionTypes from "../actionTypes";

import {
  ContentRef,
  HostRef,
  KernelRef,
  LanguageInfoMetadata,
  PayloadMessage
} from "@nteract/types";

export * from "./cells";
export * from "./contents";
export * from "./kernels";
export * from "./kernelspecs";

export const openModal = (payload: { modalType: string }) => ({
  type: actionTypes.OPEN_MODAL,
  payload
});

export const closeModal = () => ({
  type: actionTypes.CLOSE_MODAL
});

export const addHost = (payload: {
  hostRef: HostRef;
  host: {
    id?: string;
    type: "jupyter" | "local";
    defaultKernelName: string;
    token?: string;
    serverUrl?: string;
    crossDomain?: boolean;
  };
}) => ({
  type: actionTypes.ADD_HOST,
  payload
});

export function overwriteMetadataField(payload: {
  field: string;
  value: any;
  contentRef: ContentRef;
}): actionTypes.OverwriteMetadataField {
  return {
    type: actionTypes.OVERWRITE_METADATA_FIELD,
    payload
  };
}

export function deleteMetadataField(payload: {
  field: string;
  contentRef: ContentRef;
}): actionTypes.DeleteMetadataField {
  return {
    type: actionTypes.DELETE_METADATA_FIELD,
    payload
  };
}

export function setNotificationSystem(
  notificationSystem: any
): actionTypes.SetNotificationSystemAction {
  return {
    type: actionTypes.SET_NOTIFICATION_SYSTEM,
    notificationSystem
  };
}

export function setGithubToken(
  githubToken: string
): actionTypes.SetGithubTokenAction {
  return {
    type: actionTypes.SET_GITHUB_TOKEN,
    githubToken
  };
}

export function setConfigAtKey<T>(
  key: string,
  value: T
): actionTypes.SetConfigAction<T> {
  return {
    type: actionTypes.SET_CONFIG_AT_KEY,
    key,
    value
  };
}

export function setTheme(theme: string): actionTypes.SetConfigAction<string> {
  return setConfigAtKey("theme", theme);
}

export function setCursorBlink(
  value: string
): actionTypes.SetConfigAction<string> {
  return setConfigAtKey("cursorBlinkRate", value);
}

export function toggleOutputExpansion(payload: {
  id: string;
  contentRef: ContentRef;
}): actionTypes.ToggleCellExpansion {
  return {
    type: actionTypes.TOGGLE_OUTPUT_EXPANSION,
    payload
  };
}

export const loadConfig = () => ({ type: actionTypes.LOAD_CONFIG });
export const saveConfig = () => ({ type: actionTypes.SAVE_CONFIG });
export const doneSavingConfig = () => ({
  type: actionTypes.DONE_SAVING_CONFIG
});

export const configLoaded = (config: any) => ({
  type: actionTypes.MERGE_CONFIG,
  config
});

/**
 * Action creator for comm_open messages
 * @param  {jmp.Message} a comm_open message
 * @return {Object}      COMM_OPEN action
 */
export function commOpenAction(message: any) {
  // invariant: expects a comm_open message
  return {
    type: actionTypes.COMM_OPEN,
    data: message.content.data,
    metadata: message.content.metadata,
    comm_id: message.content.comm_id,
    target_name: message.content.target_name,
    target_module: message.content.target_module,
    // Pass through the buffers
    buffers: message.blob || message.buffers
    // NOTE: Naming inconsistent between jupyter notebook and jmp
    //       see https://github.com/n-riesco/jmp/issues/14
    //       We just expect either one
  };
}

/**
 * Action creator for comm_msg messages
 * @param  {jmp.Message} a comm_msg
 * @return {Object}      COMM_MESSAGE action
 */
export function commMessageAction(message: any) {
  return {
    type: actionTypes.COMM_MESSAGE,
    comm_id: message.content.comm_id,
    data: message.content.data,
    // Pass through the buffers
    buffers: message.blob || message.buffers
    // NOTE: Naming inconsistent between jupyter notebook and jmp
    //       see https://github.com/n-riesco/jmp/issues/14
    //       We just expect either one
  };
}

export function appendOutput(payload: {
  id: CellId;
  output: Output;
  contentRef: ContentRef;
}): actionTypes.AppendOutput {
  return {
    type: actionTypes.APPEND_OUTPUT,
    payload
  };
}

export function acceptPayloadMessage(payload: {
  id: CellId;
  // TODO: Properly type acceptPayloadMessage as taking jupyter payload message
  // Not to be confused with a redux style action payload
  payload: PayloadMessage;
  contentRef: ContentRef;
}): actionTypes.AcceptPayloadMessage {
  return {
    type: actionTypes.ACCEPT_PAYLOAD_MESSAGE,
    payload
  };
}

export function updateDisplay(payload: {
  content: {
    data: MimeBundle;
    metadata: JSONObject;
    transient: { display_id: string };
  };
  contentRef: ContentRef;
}): actionTypes.UpdateDisplay {
  return {
    type: actionTypes.UPDATE_DISPLAY,
    payload
  };
}

export function updateDisplayFailed(payload: {
  error: Error;
  contentRef: ContentRef;
}): actionTypes.UpdateDisplayFailed {
  return {
    type: actionTypes.UPDATE_DISPLAY_FAILED,
    payload,
    error: true
  };
}

export function setLanguageInfo(payload: {
  langInfo: LanguageInfoMetadata;
  kernelRef: KernelRef;
  contentRef: ContentRef;
}): actionTypes.SetLanguageInfo {
  return {
    type: actionTypes.SET_LANGUAGE_INFO,
    payload
  };
}

export function publishGist(payload: {
  contentRef: ContentRef;
}): actionTypes.PublishGist {
  return {
    type: actionTypes.PUBLISH_GIST,
    payload
  };
}

export function coreError(payload: Error): actionTypes.CoreError {
  return {
    type: "CORE/ERROR",
    payload,
    error: true
  };
}
