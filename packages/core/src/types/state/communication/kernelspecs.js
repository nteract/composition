// @flow
import type { KernelspecsRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { Map, Record } from "immutable";

export type KernelspecsCommunicationRecordProps = {
  loading: boolean,
  error: ?Object
};

export const makeKernelspecsCommunicationRecord: RecordFactory<
  KernelspecsCommunicationRecordProps
> = Record({
  loading: false,
  error: null
});

export type AllKernelspecsCommunicationRecordProps = {
  byRef: Map<KernelspecsRef, RecordOf<KernelspecsCommunicationRecordProps>>
};

export const makeAllKernelspecsCommunicationRecord: RecordFactory<
  AllKernelspecsCommunicationRecordProps
> = Record({
  byRef: Map()
});
