import { Kernelspecs } from "@nteract/types";
import { mkdirpObservable, writeFileObservable } from "fs-observable";
import { RecordOf } from "immutable";
import * as Immutable from "immutable";
import * as path from "path";
import { Reducer } from "redux";
import { combineEpics, ofType, StateObservable } from "redux-observable";
import { mapTo, switchMap } from "rxjs/operators";
import { Configuration, ConfigurationState } from "../schema";

import { CONFIG_FILE_PATH } from "../paths";

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
    state!.set("kernelspecs", Immutable.fromJS(action.payload));

export const saveConfigEpic = combineEpics(
  (action$, state$: StateObservable<ConfigurationState>) =>
    action$.pipe(
      ofType("SET_CONFIG_AT_KEY"),
      switchMap(
        () => mkdirpObservable(path.dirname(CONFIG_FILE_PATH)),
      ),
      switchMap(() =>
        writeFileObservable(
          CONFIG_FILE_PATH,
          JSON.stringify(state$.value.config.toJS())
        ).pipe(
          mapTo({ type: "CONFIG_SAVED" }),
        )
      ),
    ),
);
