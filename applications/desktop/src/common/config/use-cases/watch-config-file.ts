import { readFileObservable, watchFileObservable } from "fs-observable";
import { Record, RecordOf } from "immutable";
import { Action, Reducer } from "redux";
import { combineEpics, ofType } from "redux-observable";
import { concat, of } from "rxjs";
import { map, mapTo, skipWhile, switchMap } from "rxjs/operators";

import { mapErrorTo } from "../../utils";
import { CONFIG_FILE_PATH } from "../paths";
import { Configuration } from "../schema";

export type WatchConfigFileAction = Action<"WATCH_CONFIG_FILE">;

export const watchConfigFile =
  (): WatchConfigFileAction => ({ type: "WATCH_CONFIG_FILE" });

export const loadConfigEpic = combineEpics(
  (action$) =>
    action$.pipe(
      ofType("WATCH_CONFIG_FILE"),
      switchMap(() =>
        concat(
          of({ type: "LOAD_CONFIG" }),
          watchFileObservable(CONFIG_FILE_PATH).pipe(
            mapTo({ type: "LOAD_CONFIG" }),
          ),
        )
      ),
    ),
  (action$) =>
    action$.pipe(
      ofType("LOAD_CONFIG"),
      switchMap(() =>
        readFileObservable(CONFIG_FILE_PATH).pipe(
          mapErrorTo("{}", err => err.code === "ENOENT"),
          map(data => JSON.parse(data.toString())),
          // SyntaxError means the file is probably in the middle of a write
          mapErrorTo(undefined, err => err.name === "SyntaxError"),
          skipWhile(data => data === undefined),
          map(config => ({ type: "MERGE_CONFIG", payload: { config } })),
        )
      ),
    ),
);

export interface MergeConfigAction {
  type: "MERGE_CONFIG";
  payload: {
    config: Configuration;
  };
}

export const mergeConfigReducer:
  Reducer<RecordOf<Configuration>, MergeConfigAction> =
  (state, action) =>
    state!.mergeDeep(action.payload.config);
