// @flow
import type { KernelRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { Map, Record } from "immutable";

export type KernelCommunicationRecordProps = {
  loading: boolean,
  error: ?Object
};

export const makeKernelCommunicationRecord: RecordFactory<
  KernelCommunicationRecordProps
> = Record({
  loading: false,
  error: null
});

export type KernelsCommunicationRecordProps = {
  byRef: Map<KernelRef, RecordOf<KernelCommunicationRecordProps>>
};

export const makeKernelsCommunicationRecord: RecordFactory<
  KernelsCommunicationRecordProps
> = Record({
  byRef: Map()
});
