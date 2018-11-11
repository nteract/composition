import * as React from "react";

interface WrapperProps {
  children: React.ReactNode;
  outerProps: any;
  width: number;
  height: number;
  viewBox: string;
}

export const SVGWrapper = (props: WrapperProps) => {
  return (
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.width}
        height={props.height}
        viewBox={props.viewBox}
        {...props.outerProps}
        style={{
          fill: "currentColor",
          display: "inline-block",
          verticalAlign: "text-bottom",
          ...props.outerProps.style
        }}
      >
        {props.children}
      </svg>
    </span>
  );
};

export const MarkdownOcticon = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <title>Create Text Cell</title>
    <path
      fillRule="evenodd"
      d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z"
    />
  </SVGWrapper>
);

export const CodeOcticon = (props: any) => (
  <SVGWrapper width={14} height={16} viewBox="0 0 14 16" outerProps={props}>
    <title>Create Code Cell</title>
    <path
      fillRule="evenodd"
      d="M9.5 3L8 4.5 11.5 8 8 11.5 9.5 13 14 8 9.5 3zm-5 0L0 8l4.5 5L6 11.5 2.5 8 6 4.5 4.5 3z"
    />
  </SVGWrapper>
);

export const DownArrowOcticon = (props: any) => (
  <SVGWrapper width={10} height={16} viewBox="0 0 10 16" outerProps={props}>
    <title>Merge Cells</title>
    <path fillRule="evenodd" d="M5 3L0 9h3v4h4V9h3z" />
  </SVGWrapper>
);

export const PinOcticon = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <title>Pin Cell to Top</title>
    <path
      fillRule="evenodd"
      d="M10 1.2V2l.5 1L6 6H2.2c-.44 0-.67.53-.34.86L5 10l-4 5 5-4 3.14 3.14a.5.5 0 0 0 .86-.34V10l3-4.5 1 .5h.8c.44 0 .67-.53.34-.86L10.86.86a.5.5 0 0 0-.86.34z"
    />
  </SVGWrapper>
);

export const TrashOcticon = (props: any) => (
  <SVGWrapper width={12} height={16} viewBox="0 0 12 16" outerProps={props}>
    <title>Delete Cell</title>
    <path
      fillRule="evenodd"
      d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
    />
  </SVGWrapper>
);

export const TriangleRightOcticon = (props: any) => (
  <SVGWrapper width={6} height={16} viewBox="0 0 6 16" outerProps={props}>
    <title>Run Cell</title>
    <path fillRule="evenodd" d="M0 14l6-6-6-6z" />
  </SVGWrapper>
);

export const ChevronDownOcticon = (props: any) => (
  <SVGWrapper width={10} height={16} viewBox="0 0 10 16" outerProps={props}>
    <title>Show Additional Actions</title>
    <path fillRule="evenodd" d="M5 11L0 6l1.5-1.5L5 8.25 8.5 4.5 10 6z" />
  </SVGWrapper>
);

export const LinkExternalOcticon = (props: any) => (
  <SVGWrapper width={12} height={16} viewBox="0 0 12 16" outerProps={props}>
    <title>Cell Placeholder for Pinned Cell</title>
    <path
      fillRule="evenodd"
      d="M11 10h1v3c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h3v1H1v10h10v-3zM6 2l2.25 2.25L5 7.5 6.5 9l3.25-3.25L12 8V2H6z"
    />
  </SVGWrapper>
);

export const GraphOcticon = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <title>Display Bar Graph</title>
    <path
      fillRule="evenodd"
      d="M16 14v1H0V0h1v14h15zM5 13H3V8h2v5zm4 0H7V3h2v10zm4 0h-2V6h2v7z"
    />
  </SVGWrapper>
);

export const PulseOcticon = (props: any) => (
  <SVGWrapper width={14} height={16} viewBox="0 0 14 16" outerProps={props}>
    <title>Display Line Graph</title>
    <path
      fillRule="evenodd"
      d="M11.5 8L8.8 5.4 6.6 8.5 5.5 1.6 2.38 8H0v2h3.6l.9-1.8.9 5.4L9 8.5l1.6 1.5H14V8z"
    />
  </SVGWrapper>
);

export const DatabaseOcticon = (props: any) => (
  <SVGWrapper width={12} height={16} viewBox="0 0 12 16" outerProps={props}>
    <title>Display Data Table</title>
    <path
      fillRule="evenodd"
      d="M6 15c-3.31 0-6-.9-6-2v-2c0-.17.09-.34.21-.5.67.86 3 1.5 5.79 1.5s5.12-.64 5.79-1.5c.13.16.21.33.21.5v2c0 1.1-2.69 2-6 2zm0-4c-3.31 0-6-.9-6-2V7c0-.11.04-.21.09-.31.03-.06.07-.13.12-.19C.88 7.36 3.21 8 6 8s5.12-.64 5.79-1.5c.05.06.09.13.12.19.05.1.09.21.09.31v2c0 1.1-2.69 2-6 2zm0-4c-3.31 0-6-.9-6-2V3c0-1.1 2.69-2 6-2s6 .9 6 2v2c0 1.1-2.69 2-6 2zm0-5c-2.21 0-4 .45-4 1s1.79 1 4 1 4-.45 4-1-1.79-1-4-1z"
    />
  </SVGWrapper>
);

export const TelescopeOcticon = (props: any) => (
  <SVGWrapper width={14} height={16} viewBox="0 0 14 16" outerProps={props}>
    <title>Display Scatter Plot</title>
    <path
      fillRule="evenodd"
      d="M8 9l3 6h-1l-2-4v5H7v-6l-2 5H4l2-5 2-1zM7 0H6v1h1V0zM5 3H4v1h1V3zM2 1H1v1h1V1zM.63 9a.52.52 0 0 0-.16.67l.55.92c.13.23.41.31.64.2l1.39-.66-1.16-2-1.27.86.01.01zm7.89-5.39l-5.8 3.95L3.95 9.7l6.33-3.03-1.77-3.06h.01zm4.22 1.28l-1.47-2.52a.51.51 0 0 0-.72-.17l-1.2.83 1.84 3.2 1.33-.64c.27-.13.36-.44.22-.7z"
    />
  </SVGWrapper>
);

export const FileText = (props: any) => (
  <SVGWrapper width={12} height={16} viewBox="0 0 12 16" outerProps={props}>
    <title>File</title>
    <path d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z" />
  </SVGWrapper>
);

export const Book = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <title>Notebook</title>
    <path
      fillRule="evenodd"
      d="M3 5h4v1H3V5zm0 3h4V7H3v1zm0 2h4V9H3v1zm11-5h-4v1h4V5zm0 2h-4v1h4V7zm0 2h-4v1h4V9zm2-6v9c0 .55-.45 1-1 1H9.5l-1 1-1-1H2c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h5.5l1 1 1-1H15c.55 0 1 .45 1 1zm-8 .5L7.5 3H2v9h6V3.5zm7-.5H9.5l-.5.5V12h6V3z"
    />
  </SVGWrapper>
);

export const FileDirectory = (props: any) => (
  <SVGWrapper width={14} height={16} viewBox="0 0 14 16" outerProps={props}>
    <title>Directory</title>
    <path
      fillRule="evenodd"
      d="M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 4H1V3h5v1z"
    />
  </SVGWrapper>
);

export const CloudDownload = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <title>Cloud Download</title>
    <path
      fillRule="evenodd"
      d="M9 12h2l-3 3-3-3h2V7h2v5zm3-8c0-.44-.91-3-4.5-3C5.08 1 3 2.92 3 5 1.02 5 0 6.52 0 8c0 1.53 1 3 3 3h3V9.7H3C1.38 9.7 1.3 8.28 1.3 8c0-.17.05-1.7 1.7-1.7h1.3V5c0-1.39 1.56-2.7 3.2-2.7 2.55 0 3.13 1.55 3.2 1.8v1.2H12c.81 0 2.7.22 2.7 2.2 0 2.09-2.25 2.2-2.7 2.2h-2V11h2c2.08 0 4-1.16 4-3.5C16 5.06 14.08 4 12 4z"
    />
  </SVGWrapper>
);

export const Beaker = (props: any) => (
  <SVGWrapper width={16} height={16} viewBox="0 0 16 16" outerProps={props}>
    <title>Experimental Data Explorer</title>
    <path
      fillRule="evenodd"
      d="M14.38 14.59L11 7V3h1V2H3v1h1v4L.63 14.59A1 1 0 0 0 1.54 16h11.94c.72 0 1.2-.75.91-1.41h-.01zM3.75 10L5 7V3h5v4l1.25 3h-7.5zM8 8h1v1H8V8zM7 7H6V6h1v1zm0-3h1v1H7V4zm0-3H6V0h1v1z"
    />
  </SVGWrapper>
);
