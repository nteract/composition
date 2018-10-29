// @flow
import * as Immutable from "immutable";
import type { ImmutableJSONMap } from "@nteract/commutable";

import type { CommunicationRecordProps } from "./communication";
import type { EntitiesRecordProps } from "./entities";
import type { KernelRef, KernelspecsRef } from "./refs";
import type { HostRecord } from "./entities/hosts";
import { makeCommunicationRecord } from "./communication";
import { makeEntitiesRecord, makeEmptyHostRecord } from "./entities";

export * from "./communication";
export * from "./entities";
export * from "./ids";
export * from "./refs";

type KernelspecMetadata = {
  name: string,
  display_name: string,
  language: string
};

// Note: this is the kernelspec as formed by spawnteract and jupyter kernelspecs --json
export type KernelspecInfo = {
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

export type CommsRecordProps = {
  targets: Immutable.Map<any, any>,
  info: Immutable.Map<any, any>,
  models: Immutable.Map<any, any>
};

export type CommsRecord = Immutable.RecordOf<CommsRecordProps>;

export const makeCommsRecord = Immutable.Record({
  targets: new Immutable.Map(),
  info: new Immutable.Map(),
  models: new Immutable.Map()
});

// Pull version from core's package.json
const version: string = require("../../package.json").version;

export type ConfigState = Immutable.Map<string, any>;

export type StateRecordProps = {
  kernelRef: ?KernelRef,
  currentKernelspecsRef: ?KernelspecsRef,
  communication: Immutable.RecordOf<CommunicationRecordProps>,
  entities: Immutable.RecordOf<EntitiesRecordProps>
};

export const makeStateRecord: Immutable.RecordFactory<
  StateRecordProps
> = Immutable.Record({
  kernelRef: null,
  currentKernelspecsRef: null,
  communication: makeCommunicationRecord(),
  entities: makeEntitiesRecord()
});

export type AppRecordProps = {
  host: HostRecord,
  githubToken: ?string,
  notificationSystem: { addNotification: Function },
  isSaving: boolean,
  lastSaved: ?Date,
  configLastSaved: ?Date,
  error: any,
  // The version number should be provided by an app on boot
  version: string
};

export const makeAppRecord: Immutable.RecordFactory<
  AppRecordProps
> = Immutable.Record({
  host: makeEmptyHostRecord(),
  githubToken: null,
  notificationSystem: {
    addNotification: (msg: { level?: "error" | "warning" }) => {
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
export type CoreRecord = Immutable.RecordOf<StateRecordProps>;

export type AppState = {
  app: AppRecord,
  comms: CommsRecord,
  config: ConfigState,
  core: CoreRecord
};
