import { MediaBundle } from "@nteract/commutable";
import * as Immutable from "immutable";
import {
  EntitiesRecordProps,
  makeEmptyHostRecord,
  makeEntitiesRecord
} from "./entities";
import { HostRecord } from "./entities/hosts";
import { KernelRef, KernelspecsRef } from "./refs";

export * from "./content-provider";
export * from "./entities";
export * from "./ids";
export * from "./refs";

import * as errors from "./errors";
export { errors };

export interface KernelspecMetadata {
  display_name: string;
  language: string;
  argv: string[];
  name?: string;
  env?: {
    [variable: string]: string;
  };
}

/**
 * This is the kernelspec as formed by spawnteract and jupyter kernelspecs --json
 */
export interface KernelspecInfo {
  name: string;
  spec: KernelspecMetadata;
}

export interface Kernelspecs {
  [name: string]: KernelspecInfo;
}

export interface NotebookMetadata {
  kernelspec: KernelspecMetadata;
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
}

export interface PagePayloadMessage {
  source: "page";
  data: MediaBundle;
  start: number;
}

export interface SetNextInputPayloadMessage {
  source: "set_next_input";
  text: string;
  replace: boolean;
}

export interface EditPayloadMessage {
  source: "edit";
  filename: string;
  line_number: number;
}

export interface AskExitPayloadMessage {
  source: "ask_exit";
  keepkernel: boolean;
}

export interface InputRequestMessage {
  prompt: string;
  password: boolean;
}

export type PayloadMessage =
  | PagePayloadMessage
  | SetNextInputPayloadMessage
  | EditPayloadMessage
  | AskExitPayloadMessage;

// Pull version from our package.json
const version: string = require("../package.json").version;

export interface StateRecordProps {
  kernelRef: KernelRef | null;
  currentKernelspecsRef?: KernelspecsRef | null;
  entities: Immutable.RecordOf<EntitiesRecordProps>;
}

export const makeStateRecord = Immutable.Record<StateRecordProps>({
  kernelRef: null,
  currentKernelspecsRef: null,
  entities: makeEntitiesRecord()
});

export type CoreRecord = Immutable.RecordOf<StateRecordProps>;

export interface AppRecordProps {
  host: HostRecord;
  githubToken?: string | null;
  isSaving: boolean;
  lastSaved?: Date | null;
  error: any;
  // The version number should be provided by an app on boot
  version: string;
}

export const makeAppRecord = Immutable.Record<AppRecordProps>({
  host: makeEmptyHostRecord(),
  githubToken: null,
  isSaving: false,
  lastSaved: null,
  error: null,
  // set the default version to @nteract/core's version
  version: `@nteract/core@${version}`
});

export type AppRecord = Immutable.RecordOf<AppRecordProps>;

export interface AppState {
  app: AppRecord;
  core: CoreRecord;
}
