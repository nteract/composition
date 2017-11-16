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
  // TODO: revert back to {...props.outerProps} when transpilation works again.
  // See: https://github.com/zeit/styled-jsx/issues/329
  const outerProps = props.outerProps;
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width}
        height={props.height}
        viewBox={props.viewBox}
        {...outerProps}
      >
        {props.children}
      </svg>
      <style jsx>{`
        svg {
          fill: currentColor;
          display: inline-block;
          vertical-align: text-bottom;
        }
      `}</style>
    </span>
  );
};

export const MarkdownOcticon = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <path
      fillRule="evenodd"
      d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z"
    />
  </SVGWrapper>
);

export const CodeOcticon = (props: any) => (
  <SVGWrapper width={14} height={16} viewBox="0 0 14 16" outerProps={props}>
    <path
      fillRule="evenodd"
      d="M9.5 3L8 4.5 11.5 8 8 11.5 9.5 13 14 8 9.5 3zm-5 0L0 8l4.5 5L6 11.5 2.5 8 6 4.5 4.5 3z"
    />
  </SVGWrapper>
);

export const DownArrowOcticon = (props: any) => (
  <SVGWrapper width={10} height={16} viewBox="0 0 10 16" outerProps={props}>
    <path fillRule="evenodd" d="M5 3L0 9h3v4h4V9h3z" />
  </SVGWrapper>
);
