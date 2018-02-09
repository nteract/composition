// @flow
import type { HostRef, KernelspecsRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { List, Map, Record } from "immutable";

export type KernelspecProps = {
  argv: List<string>,
  env: Map<string, *>,
  interruptMode: ?string,
  language: ?string,
  resources: Map<string, *>
};

export const makeKernelspec: RecordFactory<KernelspecProps> = Record({
  argv: List(),
  env: Map(),
  interruptMode: null,
  language: null,
  resources: Map()
});

export type KernelspecByNameRecordProps = {
  hostRef: ?HostRef,
  defaultKernelName: string,
  byName: Map<string, RecordOf<KernelspecProps>>
};

export const makeKernelspecByNameRecord: RecordFactory<
  KernelspecByNameRecordProps
> = Record({
  hostRef: null,
  defaultKernelName: "python",
  byName: Map()
});

export type KernelspecsRecordProps = {
  byRef: Map<KernelspecsRef, RecordOf<KernelspecByNameRecordProps>>
};

export const makeKernelspecsRecord: RecordFactory<
  KernelspecsRecordProps
> = Record({
  byRef: Map()
});
