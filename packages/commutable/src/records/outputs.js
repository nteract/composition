// @flow

import type { Metadata } from "./base";

export opaque type Mimetype: string = string;
export const castToMimetype = (s: string): Mimetype => s;

export type ExecuteResultProps = {
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
  data: Immutable.Map<Mimetype, any>,
  metadata: Metadata
};
export type ExecuteResultRecord = Immutable.RecordOf<ExecuteResultProps>;
const executeResultMaker: Immutable.RecordFactory<
  ExecuteResultProps
> = Immutable.Record({
  outputType: "execute_result",
  exeuctionCount: null
});
export function makeExecuteResult(
  executeResult: ExecuteResultProps
): ExecuteResultRecord {
  return executeResultMaker(executeResult);
}
