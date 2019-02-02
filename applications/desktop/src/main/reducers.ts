import { JupyterConnectionInfo } from "enchannel-zmq-backend";
import { Record, RecordOf } from "immutable";

import { Kernelspecs } from "@nteract/types";

import {
  QUITTING_STATE_NOT_STARTED,
  QuittingState,
  SetKernelSpecsAction,
  SetRunningKernelsAction,
  SetQuittingStateAction
} from "./actions";

interface MainStateProps {
  kernelSpecs: Kernelspecs;
  runningKernels: JupyterConnectionInfo[],
  quittingState: QuittingState;
}

type MainStateRecord = RecordOf<MainStateProps>;

const makeMainStateRecord = Record<MainStateProps>({
  kernelSpecs: {},
  runningKernels: [],
  quittingState: QUITTING_STATE_NOT_STARTED
});

function setKernelSpecs(state: MainStateRecord, action: SetKernelSpecsAction) {
  return state.set("kernelSpecs", action.payload.kernelSpecs);
}

function setRunningKernels(state: MainStateRecord, action: SetRunningKernelsAction) {
  return state.set("runningKernels", action.payload.runningKernels);
}

function setQuittingState(
  state: MainStateRecord,
  action: SetQuittingStateAction
) {
  return state.set("quittingState", action.payload.newState);
}

type MainAction = SetKernelSpecsAction | SetRunningKernelsAction | SetQuittingStateAction;

export default function rootReducer(
  state: MainStateRecord = makeMainStateRecord(),
  action: MainAction
) {
  switch (action.type) {
    case "SET_KERNELSPECS":
      return setKernelSpecs(state, action);
    case "SET_RUNNINGKERNELS":
      return setRunningKernels(state, action);
    case "SET_QUITTING_STATE":
      return setQuittingState(state, action);
    default:
      return state;
  }
}
