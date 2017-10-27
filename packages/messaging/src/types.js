export type JupyterMessageHeader<MT> = {
  msg_id: string,
  username: string,
  date: string, // ISO 8601 timestamp
  msg_type: MT, // this could be an enum
  version: string // this could be an enum
};

export type JupyterMessage<MT, C> = {
  header: JupyterMessageHeader<MT>,
  parent_header: JupyterMessageHeader<*>,
  metadata: Object,
  content: C,
  buffers?: Array<any> | null
};

export type ExecuteMessageContent = {
  code: string,
  silent: boolean,
  store_history: boolean,
  user_expressions: Object,
  allow_stdin: boolean,
  stop_on_error: boolean
};

export type ExecuteRequest = JupyterMessage<
  "execute_request",
  ExecuteMessageContent
>;

export type ImmutableJSON =
  | string
  | number
  | boolean
  | null
  | ImmutableJSONMap
  | ImmutableJSONList; // eslint-disable-line no-use-before-define
export type ImmutableJSONMap = Immutable.Map<string, ImmutableJSON>;
export type ImmutableJSONList = Immutable.List<ImmutableJSON>;

export type ExecutionCount = number | null;

export type MimeBundle = Immutable.Map<string, ImmutableJSON>;

export type ExecuteResult = {
  output_type: "execute_result",
  execution_count: ExecutionCount,
  data: MimeBundle,
  metadata: ImmutableJSONMap
};

export type DisplayData = {
  output_type: "display_data",
  data: MimeBundle,
  metadata: ImmutableJSONMap
};

export type StreamOutput = {
  output_type: "stream",
  name: "stdout" | "stderr",
  text: string
};

export type ErrorOutput = {
  output_type: "error",
  ename: string,
  evalue: string,
  traceback: Immutable.List<string>
};

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;
