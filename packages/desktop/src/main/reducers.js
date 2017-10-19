// @flow

import { MainRecord } from "./records";

declare class MainState {
  kernelSpecs: Object;
}

type SetKernelSpecsAction = {
  type: "SET_KERNELSPECS",
  kernelSpecs: Object
};

function setKernelSpecs(state: MainState, action: SetKernelSpecsAction) {
  return state.set("kernelSpecs", action.kernelSpecs);
}

type MainAction = SetKernelSpecsAction;
const defaultMainState = MainRecord();

export default function handleApp(
  state: MainState = defaultMainState,
  action: MainAction
) {
  switch (action.type) {
    case "SET_KERNELSPECS":
      return setKernelSpecs(state, action);
    default:
      return state;
  }
}
