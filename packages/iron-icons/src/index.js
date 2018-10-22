// @flow
import React from "react";
import type { ChildrenArray } from "react";

type WrapperProps<T> = {
  children: ChildrenArray<T>,
  outerProps: any,
  width: number,
  height: number,
  viewBox: string
};

export const SVGWrapper = (props: WrapperProps<*>) => {
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width}
        height={props.height}
        viewBox={props.viewBox}
        {...props.outerProps}
        style={Object.assign(
          {
            fill: "currentColor",
            display: "inline-block",
            verticalAlign: "text-bottom"
          },
          props.outerProps.style
        )}
      >
        {props.children}
      </svg>
    </span>
  );
};

export const SavingingIcon = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 24 24" outerProps={props}>
    <title>Saving...</title>
    <path
      fillRule="evenodd"
      d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
    />
  </SVGWrapper>
);

export const LoadingIcon = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 24 24" outerProps={props}>
    <title>Loading...</title>
    <path
      fillRule="evenodd"
      d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"
    />
  </SVGWrapper>
);

export const ErrorIcon = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 24 24" outerProps={props}>
    <title>Error</title>
    <path
      fillRule="evenodd"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
    />
  </SVGWrapper>
);
