// @flow

import type { Metadata } from "./base";

import type { OutputRef } from "./refs";

import * as Immutable from "immutable";

export opaque type Mimetype: string = string;
export const castToMimetype = (s: string): Mimetype => s;

/**
 * Individual Outputs
 */

export type ExecuteResultProps = {|
  outputType: "execute_result",
  executionCount: number | null,
  // I wish there was a way we specify the types that belong to the mimetypes
  //
  // application/json -> JSON
  // text/html -> string
  // application/vdom.v1+json -> JSON (also the VDOM spec)
  //
  // One way to do it would be with a `Record` that had "all" the mimetypes we
  // expect to use, but Records will ignore properties that aren't specified
  //
  // What might be tempting to do is have this incorporate records that transforms
  // register (?). Then they can control how to work with their own data and metadata (?)
  data: Immutable.Map<Mimetype, any>,
  metadata: Metadata
|};
export type ExecuteResultRecord = Immutable.RecordOf<ExecuteResultProps>;
const executeResultMaker: Immutable.RecordFactory<
  ExecuteResultProps
> = Immutable.Record({
  outputType: "execute_result",
  executionCount: null,
  data: Immutable.Map(),
  metadata: Immutable.Map()
});
export function makeExecuteResult(
  executeResult: ExecuteResultProps
): ExecuteResultRecord {
  return executeResultMaker(executeResult);
}

export type DisplayDataProps = {|
  outputType: "display_data",
  // Ditto my earlier comment (in ExecuteResult)
  data: Immutable.Map<Mimetype, any>,
  metadata: Metadata
|};
export type DisplayDataRecord = Immutable.RecordOf<DisplayDataProps>;
// Enforce all properties being set by having a wrapper function that takes XProps
const displayDataMaker: Immutable.RecordFactory<
  DisplayDataProps
> = Immutable.Record({
  outputType: "display_data",
  data: Immutable.Map(),
  metadata: Immutable.Map()
});
export function makeDisplayData(dd: DisplayDataProps): DisplayDataRecord {
  return displayDataMaker(dd);
}

export type StreamProps = {|
  outputType: "stream",
  name: "stdout" | "stderr",
  text: string
|};
export type StreamRecord = Immutable.RecordOf<StreamProps>;
// Enforce all properties being set by having a wrapper function that takes XProps
const streamMaker: Immutable.RecordFactory<StreamProps> = Immutable.Record({
  outputType: "stream",
  name: "stdout",
  text: ""
});
export function makeStream(s: StreamProps): StreamRecord {
  return streamMaker(s);
}

export type ErrorOutputProps = {|
  outputType: "error",
  ename: string,
  evalue: string,
  traceback: Immutable.List<string>
|};
export type ErrorOutputRecord = Immutable.RecordOf<ErrorOutputProps>;
// Enforce all properties being set by having a wrapper function that takes XProps
const errorOutputMaker: Immutable.RecordFactory<
  ErrorOutputProps
> = Immutable.Record({
  outputType: "error",
  ename: "",
  evalue: "",
  traceback: Immutable.List()
});
export function makeErrorOutput(e: ErrorOutputProps): ErrorOutputRecord {
  return errorOutputMaker(e);
}

export type OutputRecord =
  | StreamRecord
  | ErrorOutputRecord
  | DisplayDataRecord
  | ExecuteResultRecord;

/**
 * Output collections
 */
export type OutputsProps = {|
  byRef: Immutable.Map<OutputRef, OutputRecord>
|};
export type OutputsRecord = Immutable.RecordOf<OutputsProps>;
const makeOutputs: Immutable.RecordFactory<OutputsProps> = Immutable.Record({
  byRef: Immutable.Map()
});
