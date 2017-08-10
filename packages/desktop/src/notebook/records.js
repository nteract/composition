/* @flow */

import type { Subject } from "rxjs";

const Immutable = require("immutable");

/*

This is the definition of JSON that Flow provides

type JSON = | string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key:string]: JSON };
type JSONArray = Array<JSON>;

Which we'll adapt for our use of Immutable.js

*/

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

export type CodeCell = {
  cell_type: "code",
  metadata: ImmutableJSONMap,
  execution_count: ExecutionCount,
  source: string,
  outputs: Immutable.List<Output>
};

export type MarkdownCell = {
  cell_type: "markdown",
  source: string,
  metadata: ImmutableJSONMap
};

export type Cell = MarkdownCell | CodeCell;

export type KernelspecMetadata = {
  name: string,
  display_name: string,
  language: string
};

// Note: this is the kernelspec as formed by spawnteract and jupyter kernelspecs --json
export type KernelInfo = {
  name: string,
  spec: KernelspecMetadata
};

export type LanguageInfoMetadata = {
  name: string,
  codemirror_mode?: string | ImmutableJSONMap,
  file_extension?: string,
  mimetype?: string,
  pygments_lexer?: string
};

export type NotebookMetadata = {
  kernelspec: KernelspecMetadata,
  language_info: LanguageInfoMetadata
  // We're not currently using orig_nbformat in nteract. Based on the comment
  // in the schema, I'm not sure we should:
  //
  //   > Original notebook format (major number) before converting the notebook between versions. This should never be written to a file
  //
  //   from https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json#L58-L61
  //
  // It seems like an intermediate/in-memory representation that bled its way into the spec
  //
  // orig_nbformat?: number,
};

export type Channels = {
  iopub: Subject,
  shell: Subject,
  stdin: Subject,
  control: Subject
};

export type Notebook = {
  cellMap: Immutable.Map<string, Cell>,
  cellOrder: Immutable.List<string>,
  nbformat: 4,
  nbformat_minor: 0 | 1 | 2 | 3 | 4,
  metadata: NotebookMetadata
};

export const AppRecord = Immutable.Record({
  executionState: "not connected",
  token: null,
  channels: null,
  spawn: null,
  connectionFile: null,
  notificationSystem: null,
  kernelSpecName: null,
  kernelSpecDisplayName: null,
  kernelSpec: null,
  isSaving: false,
  lastSaved: null,
  configLastSaved: null,
  error: null
});

export type Document = {
  notebook: Notebook,
  transient: Immutable.Map<string, any>,
  cellPagers: any,
  outputStatuses: Immutable.Map<string, any>,
  stickyCells: Immutable.Set<any>,
  editorFocused: any,
  cellFocused: any,
  copied: Immutable.Map<any, any>
};

export const DocumentRecord = Immutable.Record({
  notebook: null,
  transient: new Immutable.Map({
    keyPathsForDisplays: new Immutable.Map()
  }),
  cellPagers: new Immutable.Map(),
  outputStatuses: new Immutable.Map(),
  stickyCells: new Immutable.Set(),
  editorFocused: null,
  cellFocused: null,
  copied: new Immutable.Map()
});

export const MetadataRecord = Immutable.Record({
  past: new Immutable.List(),
  future: new Immutable.List(),
  filename: ""
});

export const CommsRecord = Immutable.Record({
  targets: new Immutable.Map(),
  info: new Immutable.Map(),
  models: new Immutable.Map()
});

export type AppState = {
  app: AppRecord,
  metadata: MetadataRecord,
  document: DocumentRecord,
  comms: CommsRecord,
  config: Immutable.Map<string, any>
};
