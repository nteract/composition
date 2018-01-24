/* @flow */

import type {
  KernelspecsRef,
  KernelspecProps
} from "@nteract/types/core/records";
import type { Channels } from "@nteract/types/channels";
import type { ChildProcess } from "child_process"; // eslint-disable-line no-unused-vars

import type {
  ImmutableNotebook,
  CellID,
  CellType,
  ImmutableJSONType,
  MimeBundle,
  JSONObject
} from "@nteract/types/commutable";

import type {
  LanguageInfoMetadata,
  KernelInfo,
  DocumentRecord,
  LocalKernelProps,
  RemoteKernelProps
} from "@nteract/types/core/records";

import type { ExecuteRequest } from "@nteract/types/messaging";

import type { Output, StreamOutput } from "@nteract/commutable/src/v4";

export const FETCH_CONTENT = "CORE/FETCH_CONTENT";
export type FetchContent = {
  type: "CORE/FETCH_CONTENT",
  payload: {
    path: string,
    params: Object
  }
};

export const FETCH_CONTENT_FULFILLED = "CORE/FETCH_CONTENT_FULFILLED";
export type FetchContentFulfilled = {
  type: "CORE/FETCH_CONTENT_FULFILLED",
  payload: {
    path: string,
    model: any // literal response from API
  }
};

export const FETCH_CONTENT_FAILED = "CORE/FETCH_CONTENT_FAILED";
export type FetchContentFailed = {
  type: "CORE/FETCH_CONTENT_FAILED",
  payload: {
    path: string,
    error: Object
  }
};

export const FETCH_KERNELSPECS = "CORE/FETCH_KERNELSPECS";
export type FetchKernelspecs = {
  type: "CORE/FETCH_KERNELSPECS",
  payload: {
    kernelspecsRef: KernelspecsRef
  }
};

export const FETCH_KERNELSPECS_FULFILLED = "CORE/FETCH_KERNELSPECS_FULFILLED";
export type FetchKernelspecsFulfilled = {
  type: "CORE/FETCH_KERNELSPECS_FULFILLED",
  payload: {
    kernelspecsRef: KernelspecsRef,
    defaultKernelName: string,
    kernelspecs: { [string]: KernelspecProps }
  }
};

export const FETCH_KERNELSPECS_FAILED = "CORE/FETCH_KERNELSPECS_FAILED";
export type FetchKernelspecsFailed = {
  type: "CORE/FETCH_KERNELSPECS_FAILED",
  payload: {
    kernelspecsRef: KernelspecsRef,
    error: Object
  }
};

export const CHANGE_FILENAME = "CHANGE_FILENAME";
export type ChangeFilenameAction = {
  type: "CHANGE_FILENAME",
  filename: string
};

export const SET_IN_CELL = "SET_IN_CELL";
export type SetInCellAction<T> = {
  type: "SET_IN_CELL",
  id: CellID,
  path: Array<string>,
  value: T
};

export const MOVE_CELL = "MOVE_CELL";
export type MoveCellAction = {
  type: "MOVE_CELL",
  id: CellID,
  destinationId: CellID
};

export const REMOVE_CELL = "REMOVE_CELL";
export type RemoveCellAction = { type: "REMOVE_CELL", id: CellID };

export const NEW_CELL_AFTER = "NEW_CELL_AFTER";
export type NewCellAfterAction = {
  type: "NEW_CELL_AFTER",
  id: CellID,
  cellType: CellType,
  source: string
};

export const NEW_CELL_BEFORE = "NEW_CELL_BEFORE";
export type NewCellBeforeAction = {
  type: "NEW_CELL_BEFORE",
  cellType: CellType,
  id: CellID
};

export const NEW_CELL_APPEND = "NEW_CELL_APPEND";
export type NewCellAppendAction = {
  type: "NEW_CELL_APPEND",
  cellType: CellType
};

export const MERGE_CELL_AFTER = "MERGE_CELL_AFTER";
export type MergeCellAfterAction = { type: "MERGE_CELL_AFTER", id: CellID };

export const APPEND_OUTPUT = "APPEND_OUTPUT";
export type AppendOutputAction = {
  type: "APPEND_OUTPUT",
  id: CellID,
  output: Output
};

export const UPDATE_DISPLAY = "UPDATE_DISPLAY";
export type UpdateDisplayAction = {
  type: "UPDATE_DISPLAY",
  content: {
    data: MimeBundle,
    metadata: JSONObject,
    transient: { display_id: string }
  }
};

export const TOGGLE_CELL_OUTPUT_VISIBILITY = "TOGGLE_CELL_OUTPUT_VISIBILITY";
export type ToggleCellOutputVisibilityAction = {
  type: "TOGGLE_CELL_OUTPUT_VISIBILITY",
  id: CellID
};

export const TOGGLE_CELL_INPUT_VISIBILITY = "TOGGLE_CELL_INPUT_VISIBILITY";
export type ToggleCellInputVisibilityAction = {
  type: "TOGGLE_CELL_INPUT_VISIBILITY",
  id: CellID
};

export const CLEAR_OUTPUTS = "CLEAR_OUTPUTS";
export type ClearOutputsAction = { type: "CLEAR_OUTPUTS", id: CellID };

export const ACCEPT_PAYLOAD_MESSAGE_ACTION = "ACCEPT_PAYLOAD_MESSAGE_ACTION";
export type AcceptPayloadMessageAction = {
  type: "ACCEPT_PAYLOAD_MESSAGE_ACTION",
  id: CellID,
  payload: *
};

export const SET_LANGUAGE_INFO = "SET_LANGUAGE_INFO";
export type SetLanguageInfoAction = {
  type: "SET_LANGUAGE_INFO",
  langInfo: LanguageInfoMetadata
};

export const SEND_EXECUTE_REQUEST = "SEND_EXECUTE_REQUEST";
export type SendExecuteMessageAction = {
  type: "SEND_EXECUTE_REQUEST",
  id: CellID,
  message: ExecuteRequest
};

export const EXECUTE_CELL = "EXECUTE_CELL";
export type ExecuteCellAction = {
  type: "EXECUTE_CELL",
  id: CellID
};

export const EXECUTE_FOCUSED_CELL = "EXECUTE_FOCUSED_CELL";
export type ExecuteFocusedCellAction = {
  type: "EXECUTE_FOCUSED_CELL"
};

export const FOCUS_CELL = "FOCUS_CELL";
export type FocusCellAction = { type: "FOCUS_CELL", id: CellID };

export const FOCUS_NEXT_CELL = "FOCUS_NEXT_CELL";
export type FocusNextCellAction = {
  type: "FOCUS_NEXT_CELL",
  id: CellID,
  createCellIfUndefined: boolean
};

export const FOCUS_PREVIOUS_CELL = "FOCUS_PREVIOUS_CELL";
export type FocusPreviousCellAction = {
  type: "FOCUS_PREVIOUS_CELL",
  id: CellID
};

export const FOCUS_CELL_EDITOR = "FOCUS_CELL_EDITOR";
export type FocusCellEditorAction = {
  type: "FOCUS_CELL_EDITOR",
  id: CellID | null
};

export const FOCUS_NEXT_CELL_EDITOR = "FOCUS_NEXT_CELL_EDITOR";
export type FocusNextCellEditorAction = {
  type: "FOCUS_NEXT_CELL_EDITOR",
  id: CellID
};

export const FOCUS_PREVIOUS_CELL_EDITOR = "FOCUS_PREVIOUS_CELL_EDITOR";
export type FocusPreviousCellEditorAction = {
  type: "FOCUS_PREVIOUS_CELL_EDITOR",
  id: CellID
};

export const TOGGLE_STICKY_CELL = "TOGGLE_STICKY_CELL";
export type ToggleStickyCellAction = { type: "TOGGLE_STICKY_CELL", id: CellID };

export const SET_KERNEL_INFO = "SET_KERNEL_INFO";
export type SetKernelInfoAction = {
  type: "SET_KERNEL_INFO",
  kernelInfo: KernelInfo
};

export const OVERWRITE_METADATA_FIELD = "OVERWRITE_METADATA_FIELD";
export type OverwriteMetadataFieldAction = {
  type: "OVERWRITE_METADATA_FIELD",
  field: string,
  value: any
};

export const DELETE_METADATA_FIELD = "DELETE_METADATA_FIELD";
export type DeleteMetadataFieldAction = {
  type: "DELETE_METADATA_FIELD",
  field: string
};

export const UPDATE_CELL_STATUS = "UPDATE_CELL_STATUS";
export type UpdateCellStatusAction = {
  type: "UPDATE_CELL_STATUS",
  id: CellID,
  status: string
};

export const REGISTER_COMM_TARGET = "REGISTER_COMM_TARGET";
export type RegisterCommTargetAction = {
  type: "REGISTER_COMM_TARGET",
  name: string,
  handler: string
};

export const COMM_OPEN = "COMM_OPEN";
export type CommOpenAction = {
  type: "COMM_OPEN",
  target_name: string,
  target_module: string,
  data: any,
  comm_id: string
};

export const COMM_MESSAGE = "COMM_MESSAGE";
export type CommMessageAction = {
  type: "COMM_MESSAGE",
  data: any,
  comm_id: string
};

export const SET_CONFIG_AT_KEY = "SET_CONFIG_AT_KEY";
export type SetConfigAction = {
  type: "SET_CONFIG_AT_KEY",
  key: string,
  value: string
};

export const MERGE_CONFIG = "MERGE_CONFIG";
export type MergeConfigAction = {
  type: "MERGE_CONFIG",
  config: Map<string, ImmutableJSONType>
};

export const LOAD_CONFIG = "LOAD_CONFIG";
export type LoadConfigAction = { type: "LOAD_CONFIG" };

export const SAVE_CONFIG = "SAVE_CONFIG";
export type SaveConfigAction = { type: "SAVE_CONFIG" };

export const DONE_SAVING_CONFIG = "DONE_SAVING_CONFIG";
export type DoneSavingConfigAction = { type: "DONE_SAVING_CONFIG" };

export const TOGGLE_OUTPUT_EXPANSION = "TOGGLE_OUTPUT_EXPANSION";
export type ToggleCellExpansionAction = {
  type: "TOGGLE_OUTPUT_EXPANSION",
  id: CellID
};

export const CUT_CELL = "CUT_CELL";
export type CutCellAction = { type: "CUT_CELL", id: CellID };

export const COPY_CELL = "COPY_CELL";
export type CopyCellAction = { type: "COPY_CELL", id: CellID };

export const PASTE_CELL = "PASTE_CELL";
export type PasteCellAction = { type: "PASTE_CELL" };

export const CHANGE_CELL_TYPE = "CHANGE_CELL_TYPE";
export type ChangeCellTypeAction = {
  type: "CHANGE_CELL_TYPE",
  id: CellID,
  to: string
};

export const LAUNCH_KERNEL_SUCCESSFUL = "LAUNCH_KERNEL_SUCCESSFUL";
export type NewKernelAction = {
  type: "LAUNCH_KERNEL_SUCCESSFUL",
  kernel: LocalKernelProps | RemoteKernelProps
};

export const SET_EXECUTION_STATE = "SET_EXECUTION_STATE";
export type SetExecutionStateAction = {
  type: "SET_EXECUTION_STATE",
  kernelStatus: string
};

export const SET_NOTIFICATION_SYSTEM = "SET_NOTIFICATION_SYSTEM";
export type SetNotificationSystemAction = {
  type: "SET_NOTIFICATION_SYSTEM",
  notificationSystem: Object
};

// TODO: Make this action JSON serializable (don't use the Immutable.js version
//       of the notebook in this action)
// TODO: Determine the "right" name for this action creator (?)
export const DONE_SAVING = "DONE_SAVING";
export type DoneSavingAction = { type: "DONE_SAVING" };
export type SetNotebookCheckpointAction = {
  type: "DONE_SAVING",
  notebook: ImmutableNotebook
};

// TODO: Make this action JSON serializable (don't use the Immutable.js version
//       of the notebook in this action)
export const SET_NOTEBOOK = "SET_NOTEBOOK";
export type SetNotebookAction = {
  type: "SET_NOTEBOOK",
  notebook: ImmutableNotebook,
  filename?: string
};

// TODO: There's a reducer for this but it's not triggered anywhere
export const EXIT = "EXIT";
export type ExitAction = { type: "EXIT" };

export const START_SAVING = "START_SAVING";
export type StartSavingAction = { type: "START_SAVING" };

export const INTERRUPT_KERNEL = "INTERRUPT_KERNEL";
export type InterruptKernelAction = { type: "INTERRUPT_KERNEL" };

export const KILL_KERNEL = "KILL_KERNEL";
export type KillKernelAction = { type: "KILL_KERNEL" };

export const SET_GITHUB_TOKEN = "SET_GITHUB_TOKEN";
export type SetGithubTokenAction = {
  type: "SET_GITHUB_TOKEN",
  githubToken: string
};

export const LAUNCH_KERNEL = "LAUNCH_KERNEL";
export type LaunchKernelAction = {
  type: "LAUNCH_KERNEL",
  kernelSpec: Object,
  cwd: string
};

export const LAUNCH_KERNEL_BY_NAME = "LAUNCH_KERNEL_BY_NAME";
export type LaunchKernelByNameAction = {
  type: "LAUNCH_KERNEL_BY_NAME",
  kernelSpecName: string,
  cwd: string
};

// TODO: This action needs a proper flow type, its from desktop's github store
export const PUBLISH_USER_GIST = "PUBLISH_USER_GIST";
// TODO: This action needs a proper flow type, its from desktop's github store
export const PUBLISH_ANONYMOUS_GIST = "PUBLISH_ANONYMOUS_GIST";

// TODO: Relocate this action type from desktop's app.js
export const SAVE = "SAVE";
// TODO: Relocate this action type from desktop's app.js
export const SAVE_AS = "SAVE_AS";
// TODO: Relocate this action type from desktop's app.js
export const LOAD = "LOAD";

// TODO: Properly type this action, which is only produced, never consumed
export const KERNEL_RAW_STDOUT = "KERNEL_RAW_STDOUT";
// TODO: Properly type this action, which is only produced, never consumed
export const KERNEL_RAW_STDERR = "KERNEL_RAW_STDERR";

// TODO: Properly type this action type, which is consumed only by epics
export const NEW_NOTEBOOK = "NEW_NOTEBOOK";

// TODO: This needs a proper flow type, is only consumed by the epics
export const ABORT_EXECUTION = "ABORT_EXECUTION";

// TODO: Properly type these ERROR action types
export const ERROR_UPDATE_DISPLAY = "ERROR_UPDATE_DISPLAY";
export const ERROR_EXECUTING = "ERROR_EXECUTING";
export const ERROR_KERNEL_LAUNCH_FAILED = "ERROR_KERNEL_LAUNCH_FAILED";
