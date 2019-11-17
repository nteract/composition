import { ConfigState } from "@nteract/types";
import { Map } from "immutable";
import { Reducer } from "redux";
import { combineEpics } from "redux-observable";
import { saveConfigEpic, SetConfigAction, setConfigReducer } from "./set-config-at-key";
import { loadConfigEpic, MergeConfigAction, mergeConfigReducer } from "./watch-config-file";

export { setConfigAtKey } from "./set-config-at-key";
export { watchConfigFile } from "./watch-config-file";

export const reducer: Reducer<ConfigState> =
  (state = Map(), action) => {
    switch (action.type) {
      case "MERGE_CONFIG":
        return mergeConfigReducer(state, action as MergeConfigAction);
      case "SET_CONFIG_AT_KEY":
        return setConfigReducer(state, action as SetConfigAction<any>);
    }
    return state;
  };

export const epic = combineEpics(
  loadConfigEpic,
  saveConfigEpic,
);
