// @flow
import type { HostRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { Map, Record } from "immutable";

export type HostCommunicationRecordProps = {
  loading: boolean,
  error: ?Object
};

export const makeHostCommunicationRecord: RecordFactory<
  HostCommunicationRecordProps
> = Record({
  loading: false,
  error: null
});

export type HostsCommunicationRecordProps = {
  byRef: Map<HostRef, RecordOf<HostCommunicationRecordProps>>
};

export const makeHostsCommunicationRecord: RecordFactory<
  HostsCommunicationRecordProps
> = Record({
  byRef: Map()
});
