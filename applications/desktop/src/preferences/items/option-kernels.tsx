import * as React from "react";
import { connect } from "react-redux";
import { ConfigOptionEnum, ConfigOptionKernels, ConfigurationState } from "../../common/config";

import { EnumOption } from "./option-enum";

export const isKernels = (props: any): props is ConfigOptionKernels =>
  "kind" in props &&
  props.kind === "kernels";

const makeMapStateToProps =
  (state: ConfigurationState) => {
    const kernelspecs = state.config.kernelspecs;
    console.log(kernelspecs);

    return {
      options: kernelspecs === undefined
        ? []
        : Array.from(kernelspecs.map(
          value => ({
            value: value.name,
            label: value.spec.display_name,
            info: [
              `language: ${value.spec.language}`,
              value.resources_dir
                ? `found in: ${value.resources_dir}`
                : "built-in",
            ],
          })).values()),
    };
  };

export const PureKernelsOption = (props: any) =>
  <EnumOption {...props}/>;

export const KernelsOption = connect(
  makeMapStateToProps,
)(PureKernelsOption);

KernelsOption.displayName = "KernelsOption";
