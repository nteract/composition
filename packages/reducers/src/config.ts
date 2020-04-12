// Vendor modules
import * as actions from "@nteract/actions";
import { ConfigState } from "@nteract/types";
import { Map } from "immutable";

type ConfigAction = actions.SetConfigAction | actions.ConfigLoadedAction;
export function setConfig(
  state: ConfigState,
  action: ConfigAction
): Map<string, any> {
  return state.mergeDeep(action.payload);
}

export default function handleConfig(
  state: ConfigState = Map(),
  action: ConfigAction
): Map<string, any> {
  switch (action.type) {
    case actions.SET_CONFIG:
    case actions.CONFIG_LOADED:
      return setConfig(state, action);
    default:
      return state;
  }
}
