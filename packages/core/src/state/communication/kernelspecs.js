// @flow
import * as Immutable from "immutable";
import type { KernelspecsRef } from "../refs";

export type KernelspecsByRefCommunicationRecordProps = {
  loading: boolean,
  error: ?Object
};

export const makeKernelspecsByRefCommunicationRecord: Immutable.RecordFactory<
  KernelspecsByRefCommunicationRecordProps
> = Immutable.Record({
  loading: false,
  error: null
});

export type KernelspecsCommunicationRecordProps = {
  byRef: Immutable.Map<
    KernelspecsRef,
    Immutable.RecordOf<KernelspecsByRefCommunicationRecordProps>
  >
};

export const makeKernelspecsCommunicationRecord: Immutable.RecordFactory<
  KernelspecsCommunicationRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
