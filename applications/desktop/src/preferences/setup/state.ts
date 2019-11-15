import { AppState } from "@nteract/core";
import * as Immutable from "immutable";
import { ConfigSchema, ALL_PREFERENCES } from "../schema";

export type PreferencesAppState = Pick<AppState, "config">;

function makeState(schema: ConfigSchema): PreferencesAppState {
  const config: { [key: string]: string | number | boolean } = {};

  schema
    .filter(({ id }) => id)
    .forEach(({ id, default: value }) => config[id!] = value!);

  return { config: Immutable.fromJS(config) };
}

export const DEFAULT_STATE = makeState(ALL_PREFERENCES);
