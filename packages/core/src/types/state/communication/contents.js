// @flow
import type { ContentRef } from "../refs";
import type { RecordFactory, RecordOf } from "immutable";
import { Map, Record } from "immutable";

export type ContentCommunicationRecordProps = {
  loading: boolean,
  error: ?Object
};

export const makeContentCommunicationRecord: RecordFactory<
  ContentCommunicationRecordProps
> = Record({
  loading: false,
  error: null
});

export type ContentsCommunicationRecordProps = {
  byRef: Map<ContentRef, RecordOf<ContentCommunicationRecordProps>>
};

export const makeContentsCommunicationRecord: RecordFactory<
  ContentsCommunicationRecordProps
> = Record({
  byRef: Map()
});
