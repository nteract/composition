import { ConfigState } from "@nteract/types";
import { Map } from "immutable";
import { Reducer } from "redux";
import { combineEpics } from "redux-observable";
import { saveConfigEpic, SetConfigAction, setConfigAtKey, setConfigReducer } from "./set-config-at-key";
import {
  loadConfigEpic,
  MergeConfigAction,
  mergeConfigReducer,
  watchConfigFile,
  WatchConfigFileAction
} from "./watch-config-file";

export type ConfigInterfaceAction =
  | SetConfigAction<any>
  | WatchConfigFileAction
  ;

export type ReducibleConfigAction =
  | MergeConfigAction
  | SetConfigAction<any>
  ;

export const actions = {
  setConfigAtKey,
  watchConfigFile,
};

export const reducer: Reducer<ConfigState, ReducibleConfigAction> =
  (state = Map(), action) => {
    switch (action.type) {
      case "MERGE_CONFIG": return mergeConfigReducer(state, action);
      case "SET_CONFIG_AT_KEY": return setConfigReducer(state, action);
    }
    return state;
  };

export const epic = combineEpics(
  loadConfigEpic,
  saveConfigEpic,
);
