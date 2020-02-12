import { RootState } from "@nteract/myths";

export interface ConfigurationState {
  filename: string | null;
  current: any;
}

export type HasPrivateConfigurationState =
  RootState<"configuration", ConfigurationState>;
