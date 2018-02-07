/* @flow */
import type { RecordFactory, RecordOf } from "immutable";
import type { Subject } from "rxjs";
import type {
  DesktopHostRecordProps,
  JupyterHostRecordProps,
  LocalKernelProps,
  RemoteKernelProps
} from "./hosts";

const version = require("../../package.json").version;

import { List, Map, Record, Set } from "immutable";

export type { HostRef, KernelRef, KernelspecsRef } from "./refs";

export { createHostRef, createKernelRef, createKernelspecsRef } from "./refs";

export type HostRecord = RecordOf<
  DesktopHostRecordProps | JupyterHostRecordProps
>;

export {
  makeLocalKernelRecord,
  makeDesktopHostRecord,
  makeJupyterHostRecord,
  makeRemoteKernelRecord
} from "./hosts";

export type {
  CommunicationKernelspecsProps,
  KernelspecProps,
  Kernelspecs
} from "./kernelspecs";

export { makeCommunicationKernelspecs, makeKernelspec } from "./kernelspecs";

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

export type ImmutableJSONMap = Map<string, ImmutableJSON>;

export type ImmutableJSONList = List<ImmutableJSON>;

export type ExecutionCount = number | null;

export type MimeBundle = Map<string, ImmutableJSON>;

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
  traceback: List<string>
};

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

export type CodeCell = {
  cell_type: "code",
  metadata: ImmutableJSONMap,
  execution_count: ExecutionCount,
  source: string,
  outputs: List<Output>
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
  // NOTE: We're not currently using orig_nbformat in nteract. Based on the comment
  // in the schema, we won't:
  //
  //   > Original notebook format (major number) before converting the notebook between versions. This should never be written to a file
  //
  //   from https://github.com/jupyter/nbformat/blob/62d6eb8803616d198eaa2024604d1fe923f2a7b3/nbformat/v4/nbformat.v4.schema.json#L58-L61
  //
  // It seems like an intermediate/in-memory representation that bled its way into the spec, when it should have been
  // handled as separate state.
  //
  // orig_nbformat?: number,
};

export type Notebook = {
  cellMap: Map<string, Cell>,
  cellOrder: List<string>,
  nbformat: 4,
  nbformat_minor: 0 | 1 | 2 | 3 | 4,
  metadata: NotebookMetadata
};

type AppRecordProps = {
  kernel: ?RecordOf<RemoteKernelProps | LocalKernelProps>,
  host: ?HostRecord,
  githubToken: ?string,
  notificationSystem: ?Object,
  isSaving: boolean,
  lastSaved: ?Date,
  configLastSaved: ?Date,
  error: any,
  // The version number should be provided by an app on boot
  version: string
};

export const makeAppRecord: RecordFactory<AppRecordProps> = Record({
  kernel: null,
  host: null,
  githubToken: null,
  notificationSystem: null,
  isSaving: false,
  lastSaved: null,
  configLastSaved: null,
  error: null,
  // set the default version to @nteract/core's version
  version: `@nteract/core@${version}`
});

export type AppRecord = RecordOf<AppRecordProps>;

type DocumentRecordProps = {
  notebook: ?Notebook,
  transient: Map<string, any>, // has the keypaths for updating displays
  // transient should be more fully typed (be a record itself)
  // right now it's keypaths and then it looks like it's able to handle any per
  // cell transient data that will be deleted when the kernel is restarted
  cellPagers: any,
  stickyCells: ?Set<any>,
  editorFocused: any,
  cellFocused: any,
  copied: Map<any, any>
};

export const makeDocumentRecord: RecordFactory<DocumentRecordProps> = Record({
  notebook: null,
  savedNotebook: null,
  // $FlowFixMe: Immutable
  transient: new Map({
    keyPathsForDisplays: new Map()
  }),
  cellPagers: new Map(),
  stickyCells: new Set(),
  editorFocused: null,
  cellFocused: null,
  copied: new Map(),
  filename: ""
});
export type DocumentRecord = RecordOf<DocumentRecordProps>;

type CommsRecordProps = {
  targets: Map<any, any>,
  info: Map<any, any>,
  models: Map<any, any>
};

export const CommsRecord = Record({
  targets: new Map(),
  info: new Map(),
  models: new Map()
});

export type AppState = {
  app: RecordOf<AppRecordProps>,
  document: RecordOf<DocumentRecordProps>,
  comms: RecordOf<CommsRecordProps>,
  config: Map<string, any>
};
