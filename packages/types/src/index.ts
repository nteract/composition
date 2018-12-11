import * as Immutable from "immutable";

import { CommunicationRecordProps } from "./communication";
import { EntitiesRecordProps } from "./entities";
import { KernelRef, KernelspecsRef } from "./refs";
import { HostRecord } from "./entities/hosts";
import { makeCommunicationRecord } from "./communication";
import { makeEntitiesRecord, makeEmptyHostRecord } from "./entities";
import { Notification } from "react-notification-system";
import { MimeBundle } from "@nteract/commutable/src";

export * from "./communication";
export * from "./entities";
export * from "./ids";
export * from "./refs";

type KernelspecMetadata = {
  name: string;
  display_name: string;
  language: string;
};

// Note: this is the kernelspec as formed by spawnteract and jupyter kernelspecs --json
export type KernelspecInfo = {
  name: string;
  spec: KernelspecMetadata;
};

export type LanguageInfoMetadata = {
  name: string;
  codemirror_mode?: string | Immutable.Map<string, any> | object;
  file_extension?: string;
  mimetype?: string;
  pygments_lexer?: string;
};

export type NotebookMetadata = {
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
};

type PagePayloadMessage = {
  source: "page";
  data: MimeBundle;
  start: number;
};

type SetNextInputPayloadMessage = {
  source: "set_next_input";
  text: string;
  replace: boolean;
};

type EditPayloadMessage = {
  source: "edit";
  filename: string;
  line_number: number;
};

type AskExitPayloadMessage = {
  source: "ask_exit";
  keepkernel: boolean;
};

export type PayloadMessage =
  | PagePayloadMessage
  | SetNextInputPayloadMessage
  | EditPayloadMessage
  | AskExitPayloadMessage;

export type CommsRecordProps = {
  targets: Immutable.Map<any, any>;
  info: Immutable.Map<any, any>;
  models: Immutable.Map<any, any>;
};

export type CommsRecord = Immutable.RecordOf<CommsRecordProps>;

export const makeCommsRecord = Immutable.Record({
  targets: Immutable.Map(),
  info: Immutable.Map(),
  models: Immutable.Map()
});

// Pull version from our package.json
const version: string = require("../package.json").version;

export type ConfigState = Immutable.Map<string, any>;

export type StateRecordProps = {
  kernelRef?: KernelRef | null;
  currentKernelspecsRef?: KernelspecsRef | null;
  communication: Immutable.RecordOf<CommunicationRecordProps>;
  entities: Immutable.RecordOf<EntitiesRecordProps>;
};

export const makeStateRecord = Immutable.Record<StateRecordProps>({
  kernelRef: null,
  currentKernelspecsRef: null,
  communication: makeCommunicationRecord(),
  entities: makeEntitiesRecord()
} as StateRecordProps);

export type AppRecordProps = {
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
};

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
} as AppRecordProps);

export type AppRecord = Immutable.RecordOf<AppRecordProps>;
export type CoreRecord = Immutable.RecordOf<StateRecordProps>;

export type AppState = {
  app: AppRecord;
  comms: CommsRecord;
  config: ConfigState;
  core: CoreRecord;
};
