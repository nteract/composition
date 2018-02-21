// @flow
import {
  makeKernelspecsCommunicationRecord,
  makeAllKernelspecsCommunicationRecord
} from "../../../types/state/communication/kernelspecs";
import * as actionTypes from "../../../actionTypes";
import createImmutableMapReducer from "../../createImmutableMapReducer";
import { combineReducers } from "redux-immutable";

const loading = (state = false, action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS:
      return true;
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
    case actionTypes.FETCH_KERNELSPECS_FAILED:
      return false;
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS:
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
      return null;
    case actionTypes.FETCH_KERNELSPECS_FAILED:
      return action.payload.error;
    default:
      return state;
  }
};

const byRef = createImmutableMapReducer(
  action => action.kernelspecsRef,
  combineReducers({ loading, error }, makeKernelspecsCommunicationRecord)
);

export const kernelspecs = combineReducers(
  { byRef },
  makeAllKernelspecsCommunicationRecord
);
