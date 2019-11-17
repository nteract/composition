import { fromJS, RecordOf } from "immutable";
import { AnyAction } from "redux";
import { combineReducers } from "redux-immutable";
import { combineEpics } from "redux-observable";

import { Configuration } from "../schema";
import { ReceiveKernelspecsAction, receiveKernelspecsReducer } from "./receive-kernelspecs";
import { saveConfigEpic, SetConfigAction, setConfigReducer } from "./set-config-at-key";
import { loadConfigEpic, MergeConfigAction, mergeConfigReducer } from "./watch-config-file";

export { receiveKernelspecs } from "./receive-kernelspecs";
export { setConfigAtKey } from "./set-config-at-key";
export { watchConfigFile } from "./watch-config-file";

export const reducer =
  (state: RecordOf<Configuration> = fromJS({}), action: AnyAction) => {
    switch (action.type) {
      case "MERGE_CONFIG":
        return mergeConfigReducer(state,
          action as MergeConfigAction);
      case "RECEIVE_KERNELSPECS":
        return receiveKernelspecsReducer(state,
          action as ReceiveKernelspecsAction);
      case "SET_CONFIG_AT_KEY":
        return setConfigReducer(state,
          action as SetConfigAction<any>);
    }
    return state;
  };

export const epic = combineEpics(
  loadConfigEpic,
  saveConfigEpic,
);
