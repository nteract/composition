// tslint:disable:max-line-length
import { Action, makeActionFunction } from "../utils";

export const LOAD_CONFIG = "LOAD_CONFIG";
export const CONFIG_LOADED = "CONFIG_LOADED";
export const SAVE_CONFIG = "SAVE_CONFIG";
export const DONE_SAVING_CONFIG = "DONE_SAVING_CONFIG";
export const SET_CONFIG = "SET_CONFIG";

export type LoadConfigAction = Action<typeof LOAD_CONFIG>;
export type ConfigLoadedAction = Action<typeof CONFIG_LOADED, Object>;
export type SaveConfigAction = Action<typeof SAVE_CONFIG>;
export type DoneSavingConfigAction = Action<typeof DONE_SAVING_CONFIG>;
export type SetConfigAction = Action<typeof SET_CONFIG, Object>;

export const loadConfig = makeActionFunction<LoadConfigAction>(LOAD_CONFIG);
export const configLoaded = makeActionFunction<ConfigLoadedAction>(
  CONFIG_LOADED
);
export const saveConfig = makeActionFunction<SaveConfigAction>(SAVE_CONFIG);
export const doneSavingConfig = makeActionFunction<DoneSavingConfigAction>(
  DONE_SAVING_CONFIG
);
export const setConfig = makeActionFunction<SetConfigAction>(SET_CONFIG);
