// @flow
import { combineReducers } from "redux-immutable";
import { makeEntitiesRecord } from "../../../types/state/entities";

export const entities = combineReducers({}, makeEntitiesRecord);
