import * as React from "react";
import { ConfigOptionEnum, ConfigOptionKernels } from "../../common/config";

import { EnumOption } from "./option-enum";



export const isKernels = (props: any): props is ConfigOptionKernels =>
  "kind" in props &&
  props.kind === "kernels";

const kernels: ConfigOptionEnum["options"] = [
  { value: "julia-1.0", label: "Julia 1.0.3" },
  { value: "node_nteract", label: "Node (nteract)" },
  { value: "python3", label: "Python 3" },
];

export const KernelsOption = (props: ConfigOptionKernels) =>
  <EnumOption options={kernels} {...props}/>;

KernelsOption.displayName = "KernelsOption";
