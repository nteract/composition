// @flow
import * as Immutable from "immutable";
import { combineReducers } from "redux-immutable";

import * as actionTypes from "../../../actionTypes";
import {
  makeHostsRecord,
  makeJupyterHostRecord,
  makeLocalHostRecord
} from "../../../state/entities/hosts";

const byRef = (state = Immutable.Map(), action) => {
  switch (action.type) {
    case actionTypes.ADD_HOST:
      switch (action.payload.host.type) {
        case "jupyter": {
          return state.set(
            action.payload.hostRef,
            makeJupyterHostRecord(action.payload.host)
          );
        }
        case "local": {
          return state.set(
            action.payload.hostRef,
            makeLocalHostRecord(action.payload.host)
          );
        }
        default:
          throw new Error(
            `Unrecognized host type "${action.payload.host.type}".`
          );
      }
    default:
      return state;
  }
};

const refs = (state = Immutable.List(), action) => {
  switch (action.type) {
    case actionTypes.ADD_HOST:
      return state.push(action.payload.hostRef);
    default:
      return state;
  }
};

export const hosts = combineReducers({ byRef, refs }, makeHostsRecord);
