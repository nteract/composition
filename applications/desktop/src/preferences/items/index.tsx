import * as React from "react";

import { ConfigItem } from "../../common/config";
import { Heading, isHeading } from "./heading";
import { BooleanOption, isBoolean } from "./option-boolean";
import { EnumOption, isEnum } from "./option-enum";
import { isKernels, KernelsOption } from "./option-kernels";


export const Item = (props: ConfigItem) =>
  <React.Fragment>
    {isHeading(props) ? <Heading       {...props}/> : null}
    {isEnum(props)    ? <EnumOption    {...props}/> : null}
    {isBoolean(props) ? <BooleanOption {...props}/> : null}
    {isKernels(props) ? <KernelsOption {...props}/> : null}
  </React.Fragment>;
