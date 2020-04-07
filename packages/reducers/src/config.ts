// Vendor modules
import * as actions from "@nteract/actions";
import { ConfigState } from "@nteract/types";
import { Map } from "immutable";

type ConfigAction =
  | actions.SetConfigAction
  | actions.MergeConfigAction
  | actions.ConfigLoadedAction;
//TODO:Useful to keep both setConfig and mergeConfig?
export function setConfig(
  state: ConfigState,
  action: actions.SetConfigAction
): Map<string, any> {
  return state.mergeDeep(action.payload);
}

export function mergeConfig(
  state: ConfigState,
  action: actions.MergeConfigAction | actions.ConfigLoadedAction
): Map<string, any> {
  const { config } = action.payload;
  return state.mergeDeep(config);
}

export default function handleConfig(
  state: ConfigState = Map(),
  action: ConfigAction
): Map<string, any> {
  switch (action.type) {
    case actions.SET_CONFIG:
      return setConfig(state, action);
    case actions.MERGE_CONFIG:
    case actions.CONFIG_LOADED:
      return mergeConfig(state, action);
    default:
      return state;
  }
}
