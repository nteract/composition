// @flow
import * as Immutable from "immutable";
import type { KernelRef } from "../refs";

export type KernelCommunicationRecordProps = {
  loading: boolean,
  error: ?Object
};

export const makeKernelCommunicationRecord: Immutable.RecordFactory<
  KernelCommunicationRecordProps
> = Immutable.Record({
  loading: false,
  error: null
});

export type KernelsCommunicationRecordProps = {
  byRef: Immutable.Map<
    KernelRef,
    Immutable.RecordOf<KernelCommunicationRecordProps>
  >
};

export const makeKernelsCommunicationRecord: Immutable.RecordFactory<
  KernelsCommunicationRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
