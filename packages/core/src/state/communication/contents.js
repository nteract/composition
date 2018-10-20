// @flow
import * as Immutable from "immutable";
import type { ContentRef } from "../refs";

export type ContentCommunicationRecordProps = {
  loading: boolean,
  saving: boolean,
  error: ?Object
};

export const makeContentCommunicationRecord: Immutable.RecordFactory<
  ContentCommunicationRecordProps
> = Immutable.Record({
  loading: false,
  saving: false,
  error: null
});

export type ContentsCommunicationRecordProps = {
  byRef: Immutable.Map<
    ContentRef,
    Immutable.RecordOf<ContentCommunicationRecordProps>
  >
};

export const makeContentsCommunicationRecord: Immutable.RecordFactory<
  ContentsCommunicationRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
