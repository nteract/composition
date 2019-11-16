import { AppState, ConfigState } from "@nteract/types";
import { writeFileObservable } from "fs-observable";
import { Reducer } from "redux";
import { combineEpics, ofType, StateObservable } from "redux-observable";
import { mapTo, mergeMap } from "rxjs/operators";
import { CONFIG_FILE_PATH } from "../paths";

export interface SetConfigAction<T> {
  type: "SET_CONFIG_AT_KEY";
  payload: { key: string; value: T };
}

export const setConfigAtKey =
  <T>(key: string, value: T): SetConfigAction<T> => ({
    type: "SET_CONFIG_AT_KEY",
    payload: { key, value },
  });

export const setConfigReducer: Reducer<ConfigState, SetConfigAction<any>> =
  (state, action) =>
    state.set(action.payload.key, action.payload.value);

export const saveConfigEpic = combineEpics(
  (action$) =>
    action$.pipe(
      ofType("SET_CONFIG_AT_KEY"),
      mapTo({ type: "SAVE_CONFIG" })
    ),
  (action$, state$: StateObservable<Pick<AppState, "config">>) =>
    action$.pipe(
      ofType("SAVE_CONFIG"),
      mergeMap(() =>
        writeFileObservable(
          CONFIG_FILE_PATH,
          JSON.stringify(state$.value.config.toJS())
        ).pipe(
          mapTo({ type: "DONE_SAVING_CONFIG" }),
        )
      )
    ),
);