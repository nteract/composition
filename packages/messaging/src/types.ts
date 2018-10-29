import { Subject } from "rxjs";

export type MessageType =
  | "execute_request"
  | "inspect_request"
  | "kernel_info_request"
  | "complete_request"
  | "history_request"
  | "is_complete_request"
  | "comm_info_request"
  | "shutdown_request"
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
  | "execute_reply";

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
  metadata: Object;
  content: C;
  channel: string;
  buffers?: any[] | null;
}

export interface ExecuteMessageContent {
  code: string;
  silent: boolean;
  store_history: boolean;
  user_expressions: Object;
  allow_stdin: boolean;
  stop_on_error: boolean;
}

export type ExecuteRequest = JupyterMessage<
  "execute_request",
  ExecuteMessageContent
>;

export type Channels = Subject<JupyterMessage>;
