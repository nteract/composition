import { ConfigState } from "@nteract/types";
import { readFileObservable, watchFileObservable } from "fs-observable";
import { Action, Reducer } from "redux";
import { combineEpics, ofType } from "redux-observable";
import { map, mapTo, switchMap } from "rxjs/operators";
import { CONFIG_FILE_PATH } from "../paths";
import { mapErrorTo } from "../utils";

export type WatchConfigFileAction = Action<"WATCH_CONFIG_FILE">;

export const watchConfigFile =
  () => ({ type: "WATCH_CONFIG_FILE" });

export const loadConfigEpic = combineEpics(
  (action$) =>
    action$.pipe(
      ofType("WATCH_CONFIG_FILE"),
      switchMap(() =>
        watchFileObservable(
          CONFIG_FILE_PATH,
        ).pipe(
          mapTo({ type: "LOAD_CONFIG" }),
        )
      )
    ),
  (action$) =>
    action$.pipe(
      ofType("LOAD_CONFIG"),
      switchMap(() =>
        readFileObservable(CONFIG_FILE_PATH).pipe(
          mapErrorTo("{}", err => err.code === "ENOENT"),
          map(data => JSON.parse(data.toString())),
          map(config => ({ type: "MERGE_CONFIG", payload: { config  } })),
        )
      )
    ),
);

export interface MergeConfigAction {
  type: "MERGE_CONFIG";
  payload: {
    config: { [key: string]: any };
  };
}

export const mergeConfigReducer: Reducer<ConfigState, MergeConfigAction> =
  (state, action) =>
    state.merge(action.payload);
