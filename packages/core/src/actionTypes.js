/* @flow */
import type {
  ContentRef,
  HostRef,
  KernelRef,
  KernelspecsRef
} from "./state/refs";
import type { HostRecord } from "./state/entities/hosts";
import type { KernelspecProps } from "./state/entities/kernelspecs";
import type { KernelInfo } from "./state/entities/kernel-info";

import type {
  CellID,
  CellType,
  ImmutableJSONType,
  MimeBundle
} from "@nteract/commutable";

import type {
  KernelspecInfo,
  LanguageInfoMetadata,
  LocalKernelProps,
  RemoteKernelProps
} from "./state";

import type { ExecuteRequest } from "@nteract/messaging";

import type { Output } from "@nteract/commutable/src/v4";

export type ErrorAction<T: string> = {
  type: T,
  payload: Error,
  error: true
};

export const OPEN_MODAL = "CORE/OPEN_MODAL";
export type OpenModal = {
  type: "CORE/OPEN_MODAL",
  payload: {
    modalType: string
  }
};

export const CLOSE_MODAL = "CORE/CLOSE_MODAL";
export type CloseModal = {
  type: "CORE/CLOSE_MODAL"
};

export const ADD_HOST = "CORE/ADD_HOST";
export type AddHost = {
  type: "CORE/ADD_HOST",
  payload: { hostRef: HostRef, host: HostRecord }
};

export const FETCH_CONTENT = "CORE/FETCH_CONTENT";
export type FetchContent = {
  type: "CORE/FETCH_CONTENT",
  payload: {
    filepath: string,
    params: Object,
    kernelRef: KernelRef,
    contentRef: ContentRef
  }
};

export const FETCH_CONTENT_FULFILLED = "CORE/FETCH_CONTENT_FULFILLED";
export type FetchContentFulfilled = {
  type: "CORE/FETCH_CONTENT_FULFILLED",
  payload: {
    filepath: string,
    model: any, // literal response from API
    kernelRef: KernelRef,
    contentRef: ContentRef
  }
};

export const FETCH_CONTENT_FAILED = "CORE/FETCH_CONTENT_FAILED";
export type FetchContentFailed = {
  type: "CORE/FETCH_CONTENT_FAILED",
  payload: {
    filepath: string,
    error: Error,
    kernelRef: KernelRef,
    contentRef: ContentRef
  },
  error: true
};

export const FETCH_KERNELSPECS = "CORE/FETCH_KERNELSPECS";
export type FetchKernelspecs = {
  type: "CORE/FETCH_KERNELSPECS",
  payload: {
    kernelspecsRef: KernelspecsRef,
    hostRef: HostRef
  }
};

export const FETCH_KERNELSPECS_FULFILLED = "CORE/FETCH_KERNELSPECS_FULFILLED";
export type FetchKernelspecsFulfilled = {
  type: "CORE/FETCH_KERNELSPECS_FULFILLED",
  payload: {
    kernelspecsRef: KernelspecsRef,
    hostRef: HostRef,
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
  payload: {
    filepath: ?string,
    contentRef: ContentRef
  }
};

export const TOGGLE_TAG_IN_CELL = "CORE/TOGGLE_TAG_IN_CELL";
export type ToggleTagInCell = {
  // expectation is that if a tag doesn't exist, it will set it
  // if the tag is already in the collection of tags it will delete it
  type: "CORE/TOGGLE_TAG_IN_CELL",
  payload: {
    id: CellID,
    tag: string,
    contentRef: ContentRef
  }
};

export const SET_IN_CELL = "SET_IN_CELL";
export type SetInCell<T> = {
  type: "SET_IN_CELL",
  payload: {
    id: CellID,
    path: Array<string>,
    value: T,
    contentRef: ContentRef
  }
};

export const MOVE_CELL = "MOVE_CELL";
export type MoveCell = {
  type: "MOVE_CELL",
  payload: {
    id: CellID,
    destinationId: CellID,
    above: boolean,
    contentRef: ContentRef
  }
};

export const REMOVE_CELL = "REMOVE_CELL";
export type RemoveCell = {
  type: "REMOVE_CELL",
  payload: {
    id?: CellID,
    contentRef: ContentRef
  }
};

export const CREATE_CELL_BELOW = "CREATE_CELL_BELOW";
export type CreateCellBelow = {
  type: "CREATE_CELL_BELOW",
  payload: {
    id?: CellID,
    cellType: CellType,
    source: string,
    contentRef: ContentRef
  }
};

export const CREATE_CELL_ABOVE = "CREATE_CELL_ABOVE";
export type CreateCellAbove = {
  type: "CREATE_CELL_ABOVE",
  payload: {
    cellType: CellType,
    id?: CellID,
    contentRef: ContentRef
  }
};

// DEPRECATION WARNING: This action type is being deprecated. Please use CREATE_CELL_BELOW instead
export const CREATE_CELL_AFTER = "CREATE_CELL_AFTER";
export type CreateCellAfter = {
  type: "CREATE_CELL_AFTER",
  payload: {
    id?: CellID,
    cellType: CellType,
    source: string,
    contentRef: ContentRef
  }
};

// DEPRECATION WARNING: This action type is being deprecated. Please use CREATE_CELL_ABOVE instead
export const CREATE_CELL_BEFORE = "CREATE_CELL_BEFORE";
export type CreateCellBefore = {
  type: "CREATE_CELL_BEFORE",
  payload: {
    cellType: CellType,
    id?: CellID,
    contentRef: ContentRef
  }
};

export const CREATE_CELL_APPEND = "CREATE_CELL_APPEND";
export type CreateCellAppend = {
  type: "CREATE_CELL_APPEND",
  payload: {
    cellType: CellType,
    contentRef: ContentRef
  }
};

export const APPEND_OUTPUT = "APPEND_OUTPUT";
export type AppendOutput = {
  type: "APPEND_OUTPUT",
  payload: {
    id: CellID,
    output: Output,
    contentRef: ContentRef
  }
};

export const UPDATE_DISPLAY = "UPDATE_DISPLAY";
export type UpdateDisplay = {
  type: "UPDATE_DISPLAY",
  payload: {
    content: {
      data: MimeBundle,
      metadata: JSONObject,
      transient: { display_id: string }
    },
    contentRef: ContentRef
  }
};

export const UPDATE_DISPLAY_FAILED = "UPDATE_DISPLAY_FAILED";
export type UpdateDisplayFailed = {
  type: "UPDATE_DISPLAY_FAILED",
  payload: {
    error: Error,
    contentRef: ContentRef
  },
  error: true
};

export const UNHIDE_ALL = "UNHIDE_ALL";
export type UnhideAll = {
  type: "UNHIDE_ALL",
  payload: {
    inputHidden: boolean,
    outputHidden: boolean,
    contentRef: ContentRef
  }
};

export const TOGGLE_CELL_OUTPUT_VISIBILITY = "TOGGLE_CELL_OUTPUT_VISIBILITY";
export type ToggleCellOutputVisibility = {
  type: "TOGGLE_CELL_OUTPUT_VISIBILITY",
  payload: {
    id?: CellID,
    contentRef: ContentRef
  }
};

export const TOGGLE_CELL_INPUT_VISIBILITY = "TOGGLE_CELL_INPUT_VISIBILITY";
export type ToggleCellInputVisibility = {
  type: "TOGGLE_CELL_INPUT_VISIBILITY",
  payload: {
    id?: CellID,
    contentRef: ContentRef
  }
};

export const CLEAR_OUTPUTS = "CLEAR_OUTPUTS";
export type ClearOutputs = {
  type: "CLEAR_OUTPUTS",
  payload: {
    id?: CellID,
    contentRef: ContentRef
  }
};

export const CLEAR_ALL_OUTPUTS = "CLEAR_ALL_OUTPUTS";
export type ClearAllOutputs = {
  type: "CLEAR_ALL_OUTPUTS",
  payload: { contentRef: ContentRef }
};

export const ACCEPT_PAYLOAD_MESSAGE = "ACCEPT_PAYLOAD_MESSAGE";
export type AcceptPayloadMessage = {
  type: "ACCEPT_PAYLOAD_MESSAGE",
  payload: {
    id: CellID,
    payload: *,
    contentRef: ContentRef
  }
};

export const SET_KERNEL_INFO = "CORE/SET_KERNEL_INFO";
export type SetKernelInfo = {
  type: "CORE/SET_KERNEL_INFO",
  payload: {
    kernelRef: KernelRef,
    info: KernelInfo
  }
};

export const SET_LANGUAGE_INFO = "SET_LANGUAGE_INFO";
export type SetLanguageInfo = {
  type: "SET_LANGUAGE_INFO",
  payload: {
    langInfo: LanguageInfoMetadata,
    kernelRef: KernelRef,
    contentRef: ContentRef
  }
};

export const SEND_EXECUTE_REQUEST = "SEND_EXECUTE_REQUEST";
export type SendExecuteRequest = {
  type: "SEND_EXECUTE_REQUEST",
  payload: {
    id: CellID,
    message: ExecuteRequest,
    contentRef: ContentRef
  }
};

export const EXECUTE_CELL = "EXECUTE_CELL";
export type ExecuteCell = {
  type: "EXECUTE_CELL",
  payload: {
    id: CellID,
    contentRef: ContentRef
  }
};

export const EXECUTE_ALL_CELLS = "EXECUTE_ALL_CELLS";
export type ExecuteAllCells = {
  type: "EXECUTE_ALL_CELLS",
  payload: {
    contentRef: ContentRef
  }
};

export const EXECUTE_ALL_CELLS_BELOW = "EXECUTE_ALL_CELLS_BELOW";
export type ExecuteAllCellsBelow = {
  type: "EXECUTE_ALL_CELLS_BELOW",
  payload: {
    contentRef: ContentRef
  }
};

export const EXECUTE_FOCUSED_CELL = "EXECUTE_FOCUSED_CELL";
export type ExecuteFocusedCell = {
  type: "EXECUTE_FOCUSED_CELL",
  payload: {
    contentRef: ContentRef
  }
};

export const EXECUTE_CANCELED = "EXECUTE_CANCELED";
export type ExecuteCanceled = {
  type: "EXECUTE_CANCELED",
  payload: {
    id: CellID,
    contentRef: ContentRef
  }
};

export const EXECUTE_FAILED = "EXECUTE_FAILED";
export type ExecuteFailed = {
  type: "EXECUTE_FAILED",
  payload: {
    error: Error,
    contentRef: ContentRef
  },
  error: true
};

export const FOCUS_CELL = "FOCUS_CELL";
export type FocusCell = {
  type: "FOCUS_CELL",
  payload: {
    id: CellID,
    contentRef: ContentRef
  }
};

export const FOCUS_NEXT_CELL = "FOCUS_NEXT_CELL";
export type FocusNextCell = {
  type: "FOCUS_NEXT_CELL",
  payload: {
    id: ?CellID,
    createCellIfUndefined: boolean,
    contentRef: ContentRef
  }
};

export const FOCUS_PREVIOUS_CELL = "FOCUS_PREVIOUS_CELL";
export type FocusPreviousCell = {
  type: "FOCUS_PREVIOUS_CELL",
  payload: {
    id: ?CellID,
    contentRef: ContentRef
  }
};

export const FOCUS_CELL_EDITOR = "FOCUS_CELL_EDITOR";
export type FocusCellEditor = {
  type: "FOCUS_CELL_EDITOR",
  payload: {
    id: ?CellID,
    contentRef: ContentRef
  }
};

export const FOCUS_NEXT_CELL_EDITOR = "FOCUS_NEXT_CELL_EDITOR";
export type FocusNextCellEditor = {
  type: "FOCUS_NEXT_CELL_EDITOR",
  payload: {
    id: ?CellID,
    contentRef: ContentRef
  }
};

export const FOCUS_PREVIOUS_CELL_EDITOR = "FOCUS_PREVIOUS_CELL_EDITOR";
export type FocusPreviousCellEditor = {
  type: "FOCUS_PREVIOUS_CELL_EDITOR",
  payload: {
    id: ?CellID,
    contentRef: ContentRef
  }
};

// "legacy" action that pushes kernelspec info back up
// for the notebook document
export const SET_KERNELSPEC_INFO = "SET_KERNELSPEC_INFO";
export type SetKernelspecInfo = {
  type: "SET_KERNELSPEC_INFO",
  payload: {
    kernelInfo: KernelspecInfo,
    contentRef: ContentRef
  }
};

export const OVERWRITE_METADATA_FIELD = "OVERWRITE_METADATA_FIELD";
export type OverwriteMetadataField = {
  type: "OVERWRITE_METADATA_FIELD",
  payload: {
    field: string,
    value: any,
    contentRef: ContentRef
  }
};

export const DELETE_METADATA_FIELD = "DELETE_METADATA_FIELD";
export type DeleteMetadataField = {
  type: "DELETE_METADATA_FIELD",
  payload: {
    field: string,
    contentRef: ContentRef
  }
};

export const UPDATE_CELL_STATUS = "UPDATE_CELL_STATUS";
export type UpdateCellStatus = {
  type: "UPDATE_CELL_STATUS",
  payload: {
    id: CellID,
    status: string,
    contentRef: ContentRef
  }
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
export type SetConfigAction<T> = {
  type: "SET_CONFIG_AT_KEY",
  key: string,
  value: T
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
export type ToggleCellExpansion = {
  type: "TOGGLE_OUTPUT_EXPANSION",
  payload: {
    id: CellID,
    contentRef: ContentRef
  }
};

export const CUT_CELL = "CUT_CELL";
export type CutCell = {
  type: "CUT_CELL",
  payload: { id?: CellID, contentRef: ContentRef }
};

export const COPY_CELL = "COPY_CELL";
export type CopyCell = {
  type: "COPY_CELL",
  payload: { id?: CellID, contentRef: ContentRef }
};

export const PASTE_CELL = "PASTE_CELL";
export type PasteCell = {
  type: "PASTE_CELL",
  payload: { contentRef: ContentRef }
};

export const CHANGE_CELL_TYPE = "CHANGE_CELL_TYPE";
export type ChangeCellType = {
  type: "CHANGE_CELL_TYPE",
  payload: {
    id?: CellID,
    to: CellType,
    contentRef: ContentRef
  }
};

export const SET_EXECUTION_STATE = "SET_EXECUTION_STATE";
export type SetExecutionStateAction = {
  type: "SET_EXECUTION_STATE",
  payload: {
    kernelStatus: string,
    kernelRef: KernelRef
  }
};

export const SET_NOTIFICATION_SYSTEM = "SET_NOTIFICATION_SYSTEM";
export type SetNotificationSystemAction = {
  type: "SET_NOTIFICATION_SYSTEM",
  notificationSystem: Object
};

export const DOWNLOAD_CONTENT = "CORE/DOWNLOAD_CONTENT";
export type DownloadContent = {
  type: "CORE/DOWNLOAD_CONTENT",
  payload: {
    contentRef: ContentRef
  }
};

export const DOWNLOAD_CONTENT_FAILED = "CORE/DOWNLOAD_CONTENT_FAILED";
export type DownloadContentFailed = {
  type: "CORE/DOWNLOAD_CONTENT_FAILED",
  payload: { contentRef: ContentRef }
};

export const DOWNLOAD_CONTENT_FULFILLED = "CORE/DOWNLOAD_CONTENT_FULFILLED";
export type DownloadContentFulfilled = {
  type: "CORE/DOWNLOAD_CONTENT_FULFILLED",
  payload: { contentRef: ContentRef }
};

export const SAVE = "SAVE";
export type Save = {
  type: "SAVE",
  payload: {
    contentRef: ContentRef
  }
};

export const SAVE_AS = "SAVE_AS";
export type SaveAs = {
  type: "SAVE_AS",
  payload: {
    filepath: string,
    contentRef: ContentRef
  }
};

export const SAVE_FAILED = "SAVE_FAILED";
export type SaveFailed = {
  type: "SAVE_FAILED",
  payload: {
    contentRef: ContentRef
  }
};

export const SAVE_FULFILLED = "SAVE_FULFILLED";
export type SaveFulfilled = {
  type: "SAVE_FULFILLED",
  payload: {
    contentRef: ContentRef,
    // Literal response from contents API, for use with
    model: any
  }
};

export const NEW_NOTEBOOK = "NEW_NOTEBOOK";
export type NewNotebook = {
  type: "NEW_NOTEBOOK",
  payload: {
    kernelSpec: Object,
    kernelRef: KernelRef,
    contentRef: ContentRef
  }
};

export const UPDATE_FILE_TEXT = "UPDATE_FILE_TEXT";
export type UpdateFileText = {
  type: "UPDATE_FILE_TEXT",
  payload: {
    text: string,
    contentRef: ContentRef
  }
};

export const INTERRUPT_KERNEL = "INTERRUPT_KERNEL";
export type InterruptKernel = {
  type: "INTERRUPT_KERNEL",
  payload: {
    kernelRef: KernelRef
  }
};

export const INTERRUPT_KERNEL_SUCCESSFUL = "INTERRUPT_KERNEL_SUCCESSFUL";
export type InterruptKernelSuccessful = {
  type: "INTERRUPT_KERNEL_SUCCESSFUL",
  payload: {
    kernelRef: KernelRef
  }
};

export const INTERRUPT_KERNEL_FAILED = "INTERRUPT_KERNEL_FAILED";
export type InterruptKernelFailed = {
  type: "INTERRUPT_KERNEL_FAILED",
  payload: {
    error: Error,
    kernelRef: KernelRef
  },
  error: true
};

export const KILL_KERNEL = "KILL_KERNEL";
export type KillKernelAction = {
  type: "KILL_KERNEL",
  payload: {
    restarting: boolean,
    kernelRef: KernelRef
  }
};

export const KILL_KERNEL_FAILED = "KILL_KERNEL_FAILED";
export type KillKernelFailed = {
  type: "KILL_KERNEL_FAILED",
  payload: {
    error: Error,
    kernelRef: KernelRef
  },
  error: true
};

export const KILL_KERNEL_SUCCESSFUL = "KILL_KERNEL_SUCCESSFUL";
export type KillKernelSuccessful = {
  type: "KILL_KERNEL_SUCCESSFUL",
  payload: {
    kernelRef: KernelRef
  }
};

export const SET_GITHUB_TOKEN = "SET_GITHUB_TOKEN";
export type SetGithubTokenAction = {
  type: "SET_GITHUB_TOKEN",
  githubToken: string
};

export const RESTART_KERNEL = "RESTART_KERNEL";
export type RestartKernelOutputHandling = "None" | "Clear All" | "Run All";
export type RestartKernel = {
  type: "RESTART_KERNEL",
  payload: {
    outputHandling: RestartKernelOutputHandling,
    kernelRef: KernelRef,
    contentRef: ContentRef
  }
};

export const RESTART_KERNEL_FAILED = "RESTART_KERNEL_FAILED";
export type RestartKernelFailed = {
  type: "RESTART_KERNEL_FAILED",
  payload: {
    error: Error,
    kernelRef: KernelRef,
    contentRef: ContentRef
  },
  error: true
};

export const RESTART_KERNEL_SUCCESSFUL = "RESTART_KERNEL_SUCCESSFUL";
export type RestartKernelSuccessful = {
  type: "RESTART_KERNEL_SUCCESSFUL",
  payload: {
    kernelRef: KernelRef,
    contentRef: ContentRef
  }
};

export const LAUNCH_KERNEL = "LAUNCH_KERNEL";
export type LaunchKernelAction = {
  type: "LAUNCH_KERNEL",
  payload: {
    kernelRef: KernelRef,
    kernelSpec: Object,
    cwd: string,
    selectNextKernel: boolean,
    contentRef: ContentRef
  }
};

export const CHANGE_KERNEL_BY_NAME = "CHANGE_KERNEL_BY_NAME";
export type ChangeKernelByName = {
  type: "CHANGE_KERNEL_BY_NAME",
  payload: {
    kernelSpecName: string,
    oldKernelRef: ?KernelRef,
    contentRef: ContentRef
  }
};

export const LAUNCH_KERNEL_BY_NAME = "LAUNCH_KERNEL_BY_NAME";
export type LaunchKernelByNameAction = {
  type: "LAUNCH_KERNEL_BY_NAME",
  payload: {
    kernelSpecName: string,
    cwd: string,
    kernelRef: KernelRef,
    selectNextKernel: boolean,
    contentRef: ContentRef
  }
};

export const LAUNCH_KERNEL_FAILED = "LAUNCH_KERNEL_FAILED";
export type LaunchKernelFailed = {
  type: "LAUNCH_KERNEL_FAILED",
  payload: {
    error: Error,
    kernelRef: KernelRef,
    contentRef: ContentRef
  },
  error: true
};

export const LAUNCH_KERNEL_SUCCESSFUL = "LAUNCH_KERNEL_SUCCESSFUL";
export type NewKernelAction = {
  type: "LAUNCH_KERNEL_SUCCESSFUL",
  payload: {
    kernel: LocalKernelProps | RemoteKernelProps,
    kernelRef: KernelRef,
    contentRef: ContentRef,
    selectNextKernel: boolean
  }
};

export const KERNEL_RAW_STDOUT = "KERNEL_RAW_STDOUT";
export type KernelRawStdout = {
  type: "KERNEL_RAW_STDOUT",
  payload: {
    kernelRef: KernelRef,
    text: string
  }
};

export const KERNEL_RAW_STDERR = "KERNEL_RAW_STDERR";
export type KernelRawStderr = {
  type: "KERNEL_RAW_STDERR",
  payload: {
    kernelRef: KernelRef,
    text: string
  }
};

export const DELETE_CONNECTION_FILE_FAILED = "DELETE_CONNECTION_FILE_FAILED";
export type DeleteConnectionFileFailedAction = {
  type: "DELETE_CONNECTION_FILE_FAILED",
  payload: {
    error: Error,
    kernelRef: KernelRef
  },
  error: true
};

export const DELETE_CONNECTION_FILE_SUCCESSFUL =
  "DELETE_CONNECTION_FILE_SUCCESSFUL";
export type DeleteConnectionFileSuccessfulAction = {
  type: "DELETE_CONNECTION_FILE_SUCCESSFUL",
  payload: {
    kernelRef: KernelRef
  }
};

export const SHUTDOWN_REPLY_SUCCEEDED = "SHUTDOWN_REPLY_SUCCEEDED";
export type ShutdownReplySucceeded = {
  type: "SHUTDOWN_REPLY_SUCCEEDED",
  payload: {
    text: string,
    kernelRef: KernelRef
  }
};

export const SHUTDOWN_REPLY_TIMED_OUT = "SHUTDOWN_REPLY_TIMED_OUT";
export type ShutdownReplyTimedOut = {
  type: "SHUTDOWN_REPLY_TIMED_OUT",
  payload: {
    error: Error,
    kernelRef: KernelRef
  },
  error: true
};

// TODO: This action needs a proper flow type, its from desktop's github store
export const PUBLISH_GIST = "CORE/PUBLISH_GIST";
export type PublishGist = {
  type: "CORE/PUBLISH_GIST",
  payload: {
    contentRef: ContentRef
  }
};

export const ERROR = "CORE/ERROR";
export type CoreError = ErrorAction<"CORE/ERROR">;
