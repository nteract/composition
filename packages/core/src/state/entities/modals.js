// @flow
import * as Immutable from "immutable";

export type ModalsRecordProps = { modalType: string };

export type ModalsRecord = Immutable.RecordOf<ModalsRecordProps>;

export const makeModalsRecord: Immutable.RecordFactory<
  ModalsRecordProps
> = Immutable.Record({
  modalType: ""
});
