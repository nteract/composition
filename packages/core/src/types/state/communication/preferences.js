// @flow
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";

export type PreferencesCommunicationRecordProps = {
  isSaving: boolean,
  error: ?Object
};

export const makePreferencesCommunicationRecord: RecordFactory<
  PreferencesCommunicationRecordProps
> = Record({
  isSaving: false,
  error: null
});
