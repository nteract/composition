// @flow
import type { HostRef, KernelspecsRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { List, Map, Record } from "immutable";

export type KernelspecProps = {
  name: string,
  argv: List<string>,
  env: Map<string, *>,
  interruptMode: ?string,
  language: string,
  displayName: string,
  resources: Map<string, *>,
  metadata: Map<string, *>
};

export const makeKernelspec: RecordFactory<KernelspecProps> = Record({
  name: "",
  argv: List(),
  env: Map(),
  interruptMode: null,
  language: "",
  displayName: "",
  metadata: Map(),
  resources: Map()
});

export type KernelspecRecord = RecordOf<KernelspecProps>;

export type KernelspecsByRefRecordProps = {
  hostRef: ?HostRef,
  defaultKernelName: string,
  byName: Map<string, KernelspecRecord>
};

export type KernelspecsByRefRecord = RecordOf<KernelspecsByRefRecordProps>;

export const makeKernelspecsByRefRecord: RecordFactory<
  KernelspecsByRefRecordProps
> = Record({
  hostRef: null,
  defaultKernelName: "python",
  byName: Map()
});

export type KernelspecsRecordProps = {
  byRef: Map<KernelspecsRef, RecordOf<KernelspecsByRefRecordProps>>,
  refs: List<KernelspecsRef>
};

export const makeKernelspecsRecord: RecordFactory<
  KernelspecsRecordProps
> = Record({
  byRef: Map(),
  refs: List()
});

export type KernelSpecsRecord = RecordOf<KernelspecsRecordProps>;
