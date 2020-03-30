import { HasPrivateConfigurationState } from "@nteract/mythic-configuration";
import { Kernelspecs } from "@nteract/types";
import { RecordOf } from "immutable";

import { QuittingState, SetKernelSpecsAction, SetQuittingStateAction } from "./actions";

export interface MainStateProps extends HasPrivateConfigurationState {
  kernelSpecs: Kernelspecs;
  quittingState: QuittingState;
}

export type MainStateRecord = RecordOf<MainStateProps>;

export type MainAction =
  | SetKernelSpecsAction
  | SetQuittingStateAction;
