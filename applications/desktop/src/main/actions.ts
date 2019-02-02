import { Kernelspecs } from "@nteract/types";
import { JupyterConnectionInfo } from "enchannel-zmq-backend";

export type QuittingState =
  | "Not Started" // Not currently orchestrating a quit
  | "Quitting"; // In the process of closing notebooks in preparation to quit
export const QUITTING_STATE_NOT_STARTED: QuittingState = "Not Started";
export const QUITTING_STATE_QUITTING: QuittingState = "Quitting";

export interface SetKernelSpecsAction {
  type: "SET_KERNELSPECS";
  payload: {
    kernelSpecs: Kernelspecs;
  };
}

export function setKernelSpecs(kernelSpecs: Kernelspecs): SetKernelSpecsAction {
  return {
    type: "SET_KERNELSPECS",
    payload: {
      kernelSpecs
    }
  };
}

export interface SetRunningKernelsAction {
  type: "SET_RUNNINGKERNELS";
  payload: {
    runningKernels: JupyterConnectionInfo[];
  };
}

export function setRunningKernels(runningKernels: JupyterConnectionInfo[]): SetRunningKernelsAction {
  return {
    type: "SET_RUNNINGKERNELS",
    payload: {
      runningKernels
    }
  };
}

export interface SetQuittingStateAction {
  type: "SET_QUITTING_STATE";
  payload: {
    newState: QuittingState;
  };
}

export function setQuittingState(
  newState: QuittingState
): SetQuittingStateAction {
  return {
    type: "SET_QUITTING_STATE",
    payload: {
      newState
    }
  };
}
