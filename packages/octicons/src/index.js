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
        style={{
          fill: "currentColor",
          display: "inline-block",
          verticalAlign: "text-bottom"
        }}
      >
        {props.children}
      </svg>
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

export const PinOcticon = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <path
      fillRule="evenodd"
      d="M10 1.2V2l.5 1L6 6H2.2c-.44 0-.67.53-.34.86L5 10l-4 5 5-4 3.14 3.14a.5.5 0 0 0 .86-.34V10l3-4.5 1 .5h.8c.44 0 .67-.53.34-.86L10.86.86a.5.5 0 0 0-.86.34z"
    />
  </SVGWrapper>
);

export const TrashOcticon = (props: any) => (
  <SVGWrapper width={12} height={16} viewBox="0 0 12 16" outerProps={props}>
    <path
      fillRule="evenodd"
      d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
    />
  </SVGWrapper>
);

export const TriangleRightOcticon = (props: any) => (
  <SVGWrapper width={6} height={16} viewBox="0 0 6 16" outerProps={props}>
    <path fillRule="evenodd" d="M0 14l6-6-6-6z" />
  </SVGWrapper>
);

export const ChevronDownOcticon = (props: any) => (
  <SVGWrapper width={10} height={16} viewBox="0 0 10 16" outerProps={props}>
    <path fillRule="evenodd" d="M5 11L0 6l1.5-1.5L5 8.25 8.5 4.5 10 6z" />
  </SVGWrapper>
);

export const LinkExternalOcticon = (props: any) => (
  <SVGWrapper width={12} height={16} viewBox="0 0 12 16" outerProps={props}>
    <path
      fillRule="evenodd"
      d="M11 10h1v3c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h3v1H1v10h10v-3zM6 2l2.25 2.25L5 7.5 6.5 9l3.25-3.25L12 8V2H6z"
    />
  </SVGWrapper>
);

export const FileText = (props: any) => (
  <SVGWrapper width={12} height={16} viewBox="0 0 12 16" outerProps={props}>
    <path d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z" />
  </SVGWrapper>
);

export const Book = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <path
      fillRule="evenodd"
      d="M3 5h4v1H3V5zm0 3h4V7H3v1zm0 2h4V9H3v1zm11-5h-4v1h4V5zm0 2h-4v1h4V7zm0 2h-4v1h4V9zm2-6v9c0 .55-.45 1-1 1H9.5l-1 1-1-1H2c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h5.5l1 1 1-1H15c.55 0 1 .45 1 1zm-8 .5L7.5 3H2v9h6V3.5zm7-.5H9.5l-.5.5V12h6V3z"
    />
  </SVGWrapper>
);

export const FileDirectory = (props: any) => (
  <SVGWrapper width={14} height={16} viewBox="0 0 14 16" outerProps={props}>
    <path
      fillRule="evenodd"
      d="M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 4H1V3h5v1z"
    />
  </SVGWrapper>
);

export const CloudDownload = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <path
      fillRule="evenodd"
      d="M9 12h2l-3 3-3-3h2V7h2v5zm3-8c0-.44-.91-3-4.5-3C5.08 1 3 2.92 3 5 1.02 5 0 6.52 0 8c0 1.53 1 3 3 3h3V9.7H3C1.38 9.7 1.3 8.28 1.3 8c0-.17.05-1.7 1.7-1.7h1.3V5c0-1.39 1.56-2.7 3.2-2.7 2.55 0 3.13 1.55 3.2 1.8v1.2H12c.81 0 2.7.22 2.7 2.2 0 2.09-2.25 2.2-2.7 2.2h-2V11h2c2.08 0 4-1.16 4-3.5C16 5.06 14.08 4 12 4z"
    />
  </SVGWrapper>
);
