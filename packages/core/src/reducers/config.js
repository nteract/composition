/* @flow */

import { Map as ImmutableMap } from "immutable";

import type { ConfigState } from "../state";
import type { SetConfigAction, MergeConfigAction } from "../actionTypes";

type ConfigAction = SetConfigAction<*> | MergeConfigAction;

export function setConfigAtKey(state: ConfigState, action: SetConfigAction<*>) {
  const { key, value } = action;
  return state.set(key, value);
}

export function mergeConfig(state: ConfigState, action: MergeConfigAction) {
  const { config } = action;
  return state.merge(config);
}

export default function handleConfig(
  state: ConfigState = new ImmutableMap(),
  action: ConfigAction
) {
  switch (action.type) {
    case "SET_CONFIG_AT_KEY":
      return setConfigAtKey(state, action);
    case "MERGE_CONFIG":
      return mergeConfig(state, action);
    default:
      (action: empty);
      return state;
  }
}
