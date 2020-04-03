import { RootState } from "@nteract/myths";
import { Map } from "immutable";
import { Observable } from "rxjs";
import { loadConfig } from "./myths/load-config";
import { mergeConfig } from "./myths/merge-config";
import { setConfigAtKey } from "./myths/set-config-at-key";

export type Configuration = Map<string, any>;

export interface ConfigurationBackend {
  setup: () => Observable<typeof loadConfig.action>,
  load: () => Observable<typeof mergeConfig.action>
  save: (current: Configuration) => Observable<any>,
}

export interface ConfigurationState {
  backend: ConfigurationBackend | null;
  current: Configuration;
}

export interface ConfigurationOptionDefinition<TYPE = any> {
  label: string;
  key: string;
  defaultValue: TYPE;
  valuesFrom?: string;
  values?: Array<{
    label: string;
    value: TYPE;
  }>;
}

export interface ConfigurationOption<TYPE = any>
  extends ConfigurationOptionDefinition<TYPE> {

  value?: TYPE;
  selector: (state: {}) => TYPE;
  action: (value: TYPE) => typeof setConfigAtKey.action;
}

export type HasPrivateConfigurationState =
  RootState<"configuration", ConfigurationState>;
