// Vendor modules
import * as actionTypes from "@nteract/actions";
import {
  makeKernelspec,
  makeKernelspecsByRefRecord,
  makeKernelspecsRecord
} from "@nteract/types";
import { List, Map } from "immutable";
import { Action, Reducer } from "redux";
import { combineReducers } from "redux-immutable";

const byRef = (state = Map<any, any>(), action: Action): Map<{}, {}> => {
  const typedAction = action as actionTypes.FetchKernelspecsFulfilled;
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
      return state.set(
        typedAction.payload.kernelspecsRef,
        makeKernelspecsByRefRecord({
          hostRef: typedAction.payload.hostRef,
          defaultKernelName: typedAction.payload.defaultKernelName,
          byName: Map(
            Object.keys(typedAction.payload.kernelspecs).reduce((r: any, k) => {
              r[k] = makeKernelspec(typedAction.payload.kernelspecs[k]);
              return r;
            }, {})
          )
        })
      );
    default:
      return state;
  }
};

const refs = (state = List(), action: Action): List<any> => {
  let typedAction;
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS_FULFILLED:
      typedAction = action as actionTypes.FetchKernelspecsFulfilled;
      return state.includes(typedAction.payload.kernelspecsRef)
        ? state
        : state.push(typedAction.payload.kernelspecsRef);
    default:
      return state;
  }
};

export const kernelspecs: Reducer<
  {
    byRef: Map<{}, {}>;
    refs: List<any>;
  },
  Action<any>
> = combineReducers({ byRef, refs }, makeKernelspecsRecord as any);
