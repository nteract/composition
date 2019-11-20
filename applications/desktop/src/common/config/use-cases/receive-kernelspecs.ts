import { KernelInfo, KernelspecInfo, Kernelspecs, makeKernelspec } from "@nteract/types";
import { Map, Record, RecordOf } from "immutable";
import { Reducer } from "redux";
import { Configuration } from "../schema";

export interface ReceiveKernelspecsAction {
  type: "RECEIVE_KERNELSPECS";
  payload: Kernelspecs;
}

export const receiveKernelspecs =
  (kernelspecs: Kernelspecs): ReceiveKernelspecsAction => ({
    type: "RECEIVE_KERNELSPECS",
    payload: kernelspecs,
  });

export const receiveKernelspecsReducer:
  Reducer<RecordOf<Configuration>, ReceiveKernelspecsAction> =
  (state, action) =>
    state!.set("kernelspecs", Map(
      Object.keys(action.payload).reduce((r: any, k) => {
        r[k] = Record<KernelspecInfo>(action.payload[k])();
        return r;
      }, {})
    ));
