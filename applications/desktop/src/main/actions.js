// @flow strict

import type { QuittingState } from "./reducers.js";

export function setKernelSpecs(kernelSpecs: KernelSpecs) {
  return {
    type: "SET_KERNELSPECS",
    kernelSpecs: kernelSpecs
  };
}

export function setQuittingState(newState: QuittingState) {
  return {
    type: "SET_QUITTING_STATE",
    newState: newState
  };
}
