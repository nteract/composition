// @flow strict

import { Map } from "immutable";

type MainState = Map<string, *>;

type SetKernelSpecsAction = {
  type: "SET_KERNELSPECS",
  kernelSpecs: KernelSpecs
};

function setKernelSpecs(state: MainState, action: SetKernelSpecsAction) {
  return state.set("kernelSpecs", action.kernelSpecs);
}

type MainAction = SetKernelSpecsAction;

export default function handleApp(
  state: MainState = Map({ kernelSpecs: {} }),
  action: MainAction
) {
  switch (action.type) {
    case "SET_KERNELSPECS":
      return setKernelSpecs(state, action);
    default:
      return state;
  }
}
