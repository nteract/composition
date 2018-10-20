// @flow
import * as actionTypes from "../../actionTypes";
import { combineReducers } from "redux-immutable";
import { communication } from "./communication";
import { entities } from "./entities";
import { makeStateRecord } from "../../state";

// TODO: #2618: This should at a minimum be moved into a contents entry.
// TODO: This is temporary until we have sessions in place. Ideally, we point to
// a document, which knows about its session and that session knows about its
// kernel. For now, we need to keep a reference to the currently targeted kernel
// around.
const kernelRef = (state = null, action) => {
  switch (action.type) {
    case actionTypes.LAUNCH_KERNEL:
    case actionTypes.LAUNCH_KERNEL_BY_NAME:
      return action.payload.selectNextKernel ? action.payload.kernelRef : state;
    case actionTypes.LAUNCH_KERNEL_SUCCESSFUL:
      return action.payload.selectNextKernel ? action.payload.kernelRef : state;
    default:
      return state;
  }
};

const currentKernelspecsRef = (state = null, action) => {
  switch (action.type) {
    case actionTypes.FETCH_KERNELSPECS:
      return action.payload.kernelspecsRef;
    default:
      return state;
  }
};

const core = combineReducers(
  {
    communication,
    currentKernelspecsRef,
    entities,
    kernelRef
  },
  makeStateRecord
);

export default core;
