import React, { FC, HTMLAttributes } from "react";

export const Markdown = (props: any) => {
  return (
    <svg width={16} height={16} fill="none" {...props}>
      <path
        d="M2.346 11.5v-7h1.538l1.539 2.423L6.96 4.5h1.538v7H6.962V7.23L5.423 9.155 3.884 7.23V11.5H2.346zm9.269 0L9.499 9h1.25V4.5h1.5V9h1.25l-1.884 2.5z"
        fill="#22a6f1"
      />
    </svg>
  );
};

export const Delete = (props: any) => {
  return (
    <svg width={16} height={16} fill="none" {...props}>
      <path
        d="M2.346 11.5v-7h1.538l1.539 2.423L6.96 4.5h1.538v7H6.962V7.23L5.423 9.155 3.884 7.23V11.5H2.346zm9.269 0L9.499 9h1.25V4.5h1.5V9h1.25l-1.884 2.5z"
        fill="#22a6f1"
      />
    </svg>
  );
};

interface MutedProps extends HTMLAttributes<SVGElement> {
  muted?: boolean;
}

export const Commands: FC<MutedProps> = ({ muted = false }) => (
  <svg width={16} height={16} fill="none">
    <path
      d="M1 20.8L4.96 23 12 19l7.04 4L23 20.8V7.16L12.977 1.547a2 2 0 00-1.954 0L1 7.16V20.8z"
      fill="#475059"
    />
    <path
      d="M11.998 12.348L6 9.35 11.998 6l5.997 3.35-5.997 2.998z"
      fill="#BABFC4"
    />
    <path d="M6 9.351l5.998 2.994V18.7L6 15.7V9.351z" fill="#29313A" />
    <path
      d="M17.995 9.351l-5.998 2.994V18.7l5.998-2.999V9.351z"
      fill={muted ? "#475059" : "#E2E5E7"}
    />
    <path
      d="M11.998 18.694v-6.358m0 0L6 9.346m5.998 2.99L18 9.346"
      stroke="#757F88"
      strokeWidth={1.5}
    />
  </svg>
);

export const AddCell = ({ below = true }) => {
  return below ? (
    <svg width={16} height={16} fill="none">
      <path
        d="M13.5 9V3.833c0-.736-.597-1.333-1.333-1.333H3.833c-.736 0-1.333.597-1.333 1.333v8.334c0 .736.597 1.333 1.333 1.333H9M13.5 11.5v4M8 5.5v4M11.5 13.5h4"
        stroke="#22a6f1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.5l-2 2-2-2"
        stroke="#22a6f1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width={16} height={16} fill="none">
      <path
        d="M13.5 9V3.833c0-.736-.597-1.333-1.333-1.333H3.833c-.736 0-1.333.597-1.333 1.333v8.334c0 .736.597 1.333 1.333 1.333H9M13.5 11.5v4M8 5.5v4M11.5 13.5h4"
        stroke="#22a6f1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.5l-2 2-2-2"
        stroke="#22a6f1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Clear = () => {
  return (
    <svg width={16} height={16} fill="none">
      <g opacity={0.8} stroke="#22a6f1">
        <path
          d="M8 6c-4.067.5-6.686 4.72-6.5 7.5h9.35C7 11 8 6 8 6z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.5 9.5h3M10.5 7.5h4M12.5 5.5h2"
          strokeLinecap="round"
          strokeLinejoin="bevel"
        />
        <path d="M6.5 11.5s0 1.5 1 2M4.5 10.5s-1 1.5-.5 3M8 9c-.487.076-2.679-.223-3.5-1.5M8 6.175l5-5" />
      </g>
    </svg>
  );
};
export const Play = () => {
  return (
    <svg width={9} height={10} fill="none">
      <path
        d="M8.132 4.457L1.979.612A.64.64 0 001 1.155v7.69c0 .503.553.81.98.543l6.152-3.845a.64.64 0 000-1.086z"
        fill="#FFF"
        stroke="#FFF"
      />
    </svg>
  );
};

export const More = () => {
  return (
    <svg width={16} height={16} fill="none">
      <circle cx={8} cy={8} r={1} fill="#FFF" />
      <circle cx={4} cy={8} r={1} fill="#FFF" />
      <circle cx={12} cy={8} r={1} fill="#FFF" />
    </svg>
  );
};

export const File = (props: HTMLAttributes<SVGElement>) => (
  <svg width={16} height={16} fill="none" {...props}>
    <mask id="file_svg__a" fill="#fff">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 2a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-11zM9 10H5v1h4v-1zM5 8h6v1H5V8zm4-2H5v1h4V6z"
      />
    </mask>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.5 2a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5h-11zM9 10H5v1h4v-1zM5 8h6v1H5V8zm4-2H5v1h4V6z"
      fill="#757F88"
    />
    <path
      d="M5 10V9H4v1h1zm4 0h1V9H9v1zm-4 1H4v1h1v-1zm4 0v1h1v-1H9zm2-3h1V7h-1v1zM5 8V7H4v1h1zm6 1v1h1V9h-1zM5 9H4v1h1V9zm0-3V5H4v1h1zm4 0h1V5H9v1zM5 7H4v1h1V7zm4 0v1h1V7H9zM3 2.5a.5.5 0 01-.5.5V1A1.5 1.5 0 001 2.5h2zm0 11v-11H1v11h2zm-.5-.5a.5.5 0 01.5.5H1A1.5 1.5 0 002.5 15v-2zm11 0h-11v2h11v-2zm-.5.5a.5.5 0 01.5-.5v2a1.5 1.5 0 001.5-1.5h-2zm0-11v11h2v-11h-2zm.5.5a.5.5 0 01-.5-.5h2A1.5 1.5 0 0013.5 1v2zm-11 0h11V1h-11v2zM5 11h4V9H5v2zm1 0v-1H4v1h2zm3-1H5v2h4v-2zm-1 0v1h2v-1H8zm3-3H5v2h6V7zm1 2V8h-2v1h2zm-7 1h6V8H5v2zM4 8v1h2V8H4zm1-1h4V5H5v2zm1 0V6H4v1h2zm3-1H5v2h4V6zM8 6v1h2V6H8z"
      fill="#757F88"
      mask="url(#file_svg__a)"
    />
  </svg>
);

export const Folder = (props: HTMLAttributes<SVGElement>) => (
  <svg width={16} height={16} fill="none" {...props}>
    <path
      d="M7.989 5.01l-.005.006H13.5c.268 0 .484.216.484.484v7a.484.484 0 01-.484.484h-11a.484.484 0 01-.484-.484v-9c0-.268.216-.484.484-.484H6c.028 0 .055.01.075.03L7.989 5.01z"
      fill="#757F88"
      stroke="#757F88"
      strokeWidth={0.031}
    />
  </svg>
);

export const Chevron = (props: HTMLAttributes<SVGElement>) => (
  <svg width={7} height={4} fill="none" {...props}>
    <path
      d="M6 1L3.5 3.5 1 1"
      stroke="#757F88"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Eye = (props: HTMLAttributes<SVGElement>) => (
  <svg width={16} height={16} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.579 3.964c-1.157-.987-2.683-1.797-4.58-1.797-2.538 0-4.413 1.452-5.625 2.837A12.494 12.494 0 00.662 7.547a7.529 7.529 0 00-.11.232l-.007.014-.002.004V7.8L1 8l-.458-.2a.5.5 0 000 .4L1 8l-.458.2v.003l.003.004.006.014a4.467 4.467 0 00.111.232 12.494 12.494 0 001.711 2.543 9.684 9.684 0 001.658 1.516l.718-.718a8.537 8.537 0 01-1.623-1.457 11.494 11.494 0 01-1.57-2.331L1.555 8l.003-.005a11.494 11.494 0 011.57-2.332C4.246 4.38 5.871 3.167 8 3.167c1.56 0 2.85.653 3.87 1.507l.709-.71zm-2.204 2.203a3 3 0 10-4.208 4.208l.716-.715A2 2 0 119.66 6.884l.716-.717zM10 7.957l.861-.861a3 3 0 01-3.766 3.766L7.959 10H8a2 2 0 002-2.042zm-4.35 4.35a5.52 5.52 0 002.35.526c2.128 0 3.752-1.214 4.874-2.495a11.492 11.492 0 001.57-2.332L14.445 8l-.003-.005a11.491 11.491 0 00-1.846-2.635l.708-.708a12.503 12.503 0 012.033 2.895 7.346 7.346 0 01.11.232l.007.014.002.004V7.8L15 8l.458.2v.003l-.003.004-.006.014a11.288 11.288 0 01-.454.864c-.304.52-.76 1.214-1.369 1.911-1.212 1.385-3.087 2.837-5.626 2.837a6.553 6.553 0 01-3.095-.78l.745-.746zM15 8l.458.2a.5.5 0 000-.4L15 8z"
      fill="#E2E5E7"
    />
    <path
      d="M15 1L.665 15.333"
      stroke="#E2E5E7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
