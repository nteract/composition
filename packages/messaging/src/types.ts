import { JSONObject, MediaBundle } from "@nteract/commutable";
import { Subject } from "rxjs";

export type MessageType =
  "execute_request"
  | "inspect_request"
  | "inspect_reply"
  | "kernel_info_request"
  | "kernel_info_reply"
  | "complete_request"
  | "history_request"
  | "history_reply"
  | "is_complete_request"
  | "comm_info_request"
  | "comm_info_reply"
  | "shutdown_request"
  | "shutdown_reply"
  | "shell"
  | "display_data"
  | "stream"
  | "update_display_data"
  | "execute_input"
  | "execute_result"
  | "error"
  | "status"
  | "clear_output"
  | "iopub"
  | "input_request"
  | "input_reply"
  | "stdin"
  | "comm_open"
  | "comm_msg"
  | "comm_close"
  | "complete_reply"
  | "is_complete_reply"
  | "execute_reply"
  | "interrupt_request"
  | "interrupt_reply"
  | "page"
  | "set_next_input"
  | "edit"
  | "ask_exit";

export interface JupyterMessageHeader<MT extends MessageType = MessageType> {
  msg_id: string;
  username: string;
  date: string; // ISO 8601 timestamp
  msg_type: MT;
  version: string; // this could be an enum
  session: string;
}

export interface JupyterMessage<MT extends MessageType = MessageType, C = any> {
  header: JupyterMessageHeader<MT>;
  parent_header:
    | JupyterMessageHeader<any>
    | {
        msg_id?: string;
      };
  metadata: object;
  content: C;
  channel: string;
  buffers?: Uint8Array | null;
}

export interface ExecuteMessageContent {
  code: string;
  silent: boolean;
  store_history: boolean;
  user_expressions: object;
  allow_stdin: boolean;
  stop_on_error: boolean;
}

export type ExecuteRequest = JupyterMessage<
  "execute_request",
  ExecuteMessageContent
>;

export interface BasicOutputMessageContent {
  data?: object;
  metadata?: object;
  transient?: object;
}

export interface UpdateDisplayDataContent extends BasicOutputMessageContent {
  output_type: "update_display_data";
  data: MediaBundle;
  metadata: JSONObject;
  transient?: { display_id?: string };
}

export type UpdateDisplayData = JupyterMessage<
  "update_display_data",
  UpdateDisplayDataContent
>;

export type Channels = Subject<JupyterMessage>;
