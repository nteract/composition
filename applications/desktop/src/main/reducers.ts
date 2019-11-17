import { Record, RecordOf } from "immutable";

import { Kernelspecs } from "@nteract/types";
import { Configuration } from "../common/config";

import {
  QUITTING_STATE_NOT_STARTED,
  QuittingState,
  SetKernelSpecsAction,
  SetQuittingStateAction
} from "./actions";

interface MainStateProps {
  config: Configuration;
  kernelSpecs: Kernelspecs;
  quittingState: QuittingState;
}

type MainStateRecord = RecordOf<MainStateProps>;

const makeMainStateRecord = Record<MainStateProps>({
  config: {},
  kernelSpecs: {},
  quittingState: QUITTING_STATE_NOT_STARTED
});

function setKernelSpecs(state: MainStateRecord, action: SetKernelSpecsAction) {
  return state.set("kernelSpecs", action.payload.kernelSpecs);
}

function setQuittingState(
  state: MainStateRecord,
  action: SetQuittingStateAction
) {
  return state.set("quittingState", action.payload.newState);
}

type MainAction = SetKernelSpecsAction | SetQuittingStateAction;

export default function rootReducer(
  state: MainStateRecord = makeMainStateRecord(),
  action: MainAction
) {
  switch (action.type) {
    case "SET_KERNELSPECS":
      return setKernelSpecs(state, action);
    case "SET_QUITTING_STATE":
      return setQuittingState(state, action);
    default:
      return state;
  }
}
