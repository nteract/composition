import { AppState } from "@nteract/core";
import * as Immutable from "immutable";
import { ALL_PREFERENCES, ConfigSchema } from "../schema";

export type PreferencesAppState = Pick<AppState, "config">;

function makeState(schema: ConfigSchema): PreferencesAppState {
  const config: { [key: string]: any } = {};

  schema
    .filter(({ id }: any) => id)
    .forEach(({ id, initial: value }: any) => config[id] = value);

  return { config: Immutable.fromJS(config) };
}

export const DEFAULT_STATE = makeState(ALL_PREFERENCES);
