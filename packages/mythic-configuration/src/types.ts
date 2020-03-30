import { RootState } from "@nteract/myths";
import { Map } from "immutable";
import { Observable } from "rxjs";
import { loadConfig } from "./myths/load-config";
import { mergeConfig } from "./myths/merge-config";

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

export interface ConfigurationOption<TYPE = any> {
  label: string;
  key: string;
  valuesFrom?: "kernelspecs";
  values?: Array<{
    label: string;
    value: TYPE;
  }>;
}

export type HasPrivateConfigurationState =
  RootState<"configuration", ConfigurationState>;
