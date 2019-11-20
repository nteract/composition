import * as Immutable from "immutable";

import { MediaBundle } from "@nteract/commutable";
import { Notification } from "react-notification-system";
import {
  EntitiesRecordProps,
  makeEmptyHostRecord,
  makeEntitiesRecord
} from "./entities";
import { HostRecord } from "./entities/hosts";
import { KernelRef, KernelspecsRef } from "./refs";

export * from "./entities";
export * from "./ids";
export * from "./refs";

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
  files?: string[];
  resources_dir?: string;
  spec: KernelspecMetadata;
}

export interface Kernelspecs {
  [name: string]: KernelspecInfo;
}

export interface LanguageInfoMetadata {
  name: string;
  codemirror_mode?: string | Immutable.Map<string, any> | object;
  file_extension?: string;
  mimetype?: string;
  pygments_lexer?: string;
}

export interface NotebookMetadata {
  kernelspec: KernelspecMetadata;
  language_info: LanguageInfoMetadata;
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

export interface CommsRecordProps {
  targets: Immutable.Map<any, any>;
  info: Immutable.Map<any, any>;
  models: Immutable.Map<any, any>;
}

export type CommsRecord = Immutable.RecordOf<CommsRecordProps>;

export const makeCommsRecord = Immutable.Record<CommsRecordProps>({
  targets: Immutable.Map(),
  info: Immutable.Map(),
  models: Immutable.Map()
});

// Pull version from our package.json
const version: string = require("../package.json").version;

export type ConfigState = Immutable.Map<string, any>;

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
  notificationSystem: {
    addNotification: (msg: Notification) => void;
  };
  isSaving: boolean;
  lastSaved?: Date | null;
  configLastSaved?: Date | null;
  error: any;
  // The version number should be provided by an app on boot
  version: string;
}

export const makeAppRecord = Immutable.Record<AppRecordProps>({
  host: makeEmptyHostRecord(),
  githubToken: null,
  notificationSystem: {
    addNotification: (msg: Notification) => {
      let logger = console.log.bind(console);
      switch (msg.level) {
        case "error":
          logger = console.error.bind(console);
          break;
        case "warning":
          logger = console.warn.bind(console);
          break;
      }
      logger(msg);
    }
  },
  isSaving: false,
  lastSaved: null,
  configLastSaved: null,
  error: null,
  // set the default version to @nteract/core's version
  version: `@nteract/core@${version}`
});

export type AppRecord = Immutable.RecordOf<AppRecordProps>;

export interface AppState {
  app: AppRecord;
  comms: CommsRecord;
  config: ConfigState;
  core: CoreRecord;
}

export type AppStateRecord = Immutable.RecordOf<AppState>;

export const makeAppStateRecord = Immutable.Record<AppState>({
  app: makeAppRecord(),
  comms: makeCommsRecord(),
  config: Immutable.Map<string, any>(),
  core: makeStateRecord()
});
