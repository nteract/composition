import { Kernelspecs } from "@nteract/types";
import { RecordOf } from "immutable";

export interface ConfigOptionBoolean {
  id: string;
  label: string;
  values?: {
    true: string | number | boolean;
    false: string | number | boolean;
  };
  initial: boolean;
}

export interface ConfigOptionEnum {
  id: string;
  label: string;
  options: Array<{
    value: string | number;
    label: string;
  }>;
  initial: string | number | string[] | number[];
}

export interface ConfigOptionKernels {
  id: string;
  label: string;
  kind: "kernels";
  initial: string;
}

export interface ConfigHeading {
  heading: string;
}

export type ConfigOption =
  | ConfigOptionEnum
  | ConfigOptionBoolean
  | ConfigOptionKernels
  ;

export type ConfigItem = ConfigHeading | ConfigOption;
export type ConfigOptions = ConfigItem[];

export type ConfigurationValue =
  | boolean
  | string
  | number
  | string[]
  | number[]
  ;

export type Configuration = {
  [key: string]: ConfigurationValue;
} & {
  kernelspecs?: Kernelspecs;
}

export interface ConfigurationState {
  config: RecordOf<Configuration>;
}
