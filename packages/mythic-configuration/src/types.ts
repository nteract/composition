import { RootState } from "@nteract/myths";
import { Map } from "immutable";

export interface ConfigurationState {
  filename: string | null;
  current: Map<string, any>;
}

export type HasPrivateConfigurationState =
  RootState<"configuration", ConfigurationState>;
