// @flow
import { combineReducers } from "redux-immutable";
import { makeStateRecord } from "../../types/state";
import { communication } from "./communication";
import { entities } from "./entities";

export const root = combineReducers(
  {
    // TODO: selectedHostRef
    // TODO: selectedContentRef
    communication,
    entities
  },
  makeStateRecord
);
