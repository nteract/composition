// @flow
import type { CommunicationRecordProps } from "./communication";
import type { ContentRef, HostRef } from "./refs";
import type { EntitiesRecordProps } from "./entities";
import type { RecordFactory, RecordOf } from "immutable";
import { Record } from "immutable";
import { makeCommunicationRecord } from "./communication";
import { makeEntitiesRecord } from "./entities";

export type StateRecordProps = {
  selectedHostRef: ?HostRef,
  selectedContentRef: ?ContentRef,
  communication: RecordOf<CommunicationRecordProps>,
  entities: RecordOf<EntitiesRecordProps>
};

export const makeStateRecord: RecordFactory<StateRecordProps> = Record({
  selectedHostRef: null,
  selectedContentRef: null,
  communication: makeCommunicationRecord(),
  entities: makeEntitiesRecord()
});
