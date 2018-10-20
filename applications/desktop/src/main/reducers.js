/* @flow strict */

import { Map } from "immutable";

type MainState = Map<string, *>;

export opaque type QuittingState =
  | "Not Started" // Not currently orchestrating a quit
  | "Quitting"; // In the process of closing notebooks in preparation to quit
export const QUITTING_STATE_NOT_STARTED: QuittingState = "Not Started";
export const QUITTING_STATE_QUITTING: QuittingState = "Quitting";

type SetKernelSpecsAction = {
  type: "SET_KERNELSPECS",
  kernelSpecs: KernelSpecs
};

type SetQuittingStateAction = {
  type: "SET_QUITTING_STATE",
  newState: QuittingState
};

function setKernelSpecs(state: MainState, action: SetKernelSpecsAction) {
  return state.set("kernelSpecs", action.kernelSpecs);
}

function setQuittingState(state: MainState, action: SetQuittingStateAction) {
  return state.set("quittingState", action.newState);
}

type MainAction = SetKernelSpecsAction | SetQuittingStateAction;

export default function handleApp(
  state: MainState = Map({
    kernelSpecs: {},
    quittingState: QUITTING_STATE_NOT_STARTED
  }),
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
