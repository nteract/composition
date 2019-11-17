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
  initial: string | number | Array<string | number>;
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
