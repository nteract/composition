// @flow
import { combineReducers } from "redux-immutable";
import * as Immutable from "immutable";

import {
  makeKernelspecsByRefCommunicationRecord,
  makeKernelspecsCommunicationRecord
} from "../../../state/communication/kernelspecs";
import * as actionTypes from "../../../actionTypes";

export const byRef = (state = Immutable.Map(), action: *) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS:
      return state.set(
        action.payload.kernelspecsRef,
        makeKernelspecsByRefCommunicationRecord({ loading: true, error: null })
      );
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
      return state.set(
        action.payload.kernelspecsRef,
        makeKernelspecsByRefCommunicationRecord({ loading: false, error: null })
      );
    case actionTypes.FETCH_KERNELSPECS_FAILED:
      return state.set(
        action.payload.kernelspecsRef,
        makeKernelspecsByRefCommunicationRecord({
          loading: false,
          error: action.payload.error
        })
      );
    default:
      return state;
  }
};

export const kernelspecs = combineReducers(
  { byRef },
  makeKernelspecsCommunicationRecord
);
