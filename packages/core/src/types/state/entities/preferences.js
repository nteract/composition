// @flow
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";

export type PreferencesRecordProps = {
  lastSaved: ?Date
};

export const makePreferencesRecord: RecordFactory<
  PreferencesRecordProps
> = Record({
  lastSaved: null
});
