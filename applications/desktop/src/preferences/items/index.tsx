import * as React from "react";

import { ConfigHeading, Heading, isHeading } from "./heading";
import { BooleanOption, ConfigOptionBoolean, isBoolean } from "./option-boolean";
import { ConfigOptionEnum, EnumOption, isEnum } from "./option-enum";
import { ConfigOptionKernels, isKernels, KernelsOption } from "./option-kernels";

export type ConfigOption =
  | ConfigOptionEnum
  | ConfigOptionBoolean
  | ConfigOptionKernels
  ;

export type ConfigItem = ConfigHeading | ConfigOption;

export const Item = (props: ConfigItem) =>
  <React.Fragment>
    {isHeading(props) ? <Heading       {...props}/> : null}
    {isEnum(props)    ? <EnumOption    {...props}/> : null}
    {isBoolean(props) ? <BooleanOption {...props}/> : null}
    {isKernels(props) ? <KernelsOption {...props}/> : null}
  </React.Fragment>;
