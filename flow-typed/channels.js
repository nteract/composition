// @flow

declare type JupyterMessageHeader<MT: string> = {
  msg_id: string,
  username: string,
  date: string, // ISO 8601 timestamp
  msg_type: MT, // this could be an enum
  version: string // this could be an enum
};

declare type JupyterMessage<MT, C> = {
  header: JupyterMessageHeader<MT>,
  parent_header: JupyterMessageHeader<*> | {},
  metadata: Object,
  content: C,
  buffers?: Array<any> | null
};

declare type ExecuteMessageContent = {
  code: string,
  silent: boolean,
  store_history: boolean,
  user_expressions: Object,
  allow_stdin: boolean,
  stop_on_error: boolean
};

declare type ExecuteRequest = JupyterMessage<
  "execute_request",
  ExecuteMessageContent
>;

declare type Channels = rxjs$Subject<JupyterMessage<*, *>>;
