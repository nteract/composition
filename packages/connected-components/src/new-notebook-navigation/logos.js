// @flow

import * as React from "react";

/**
 * TODO: Establish a new resources spec for SVG logos used in kernel "cards".
 *
 * Description: At some point I'd like to push forward a spec for a ~1:1.4142
 * ratio (1:√2) notebook card for the selection screen (on nteract and
 * jupyterlab). For now I'll hardcode some React svg versions for kernels in
 * common use across the ~~USS~~ enterprise.
 *
 * Implemented:
 *
 *  - Python
 *  - Scala
 *
 * Needed:
 *
 *  - R
 *  - Node.js
 *
 * The easy solution to getting another kernel supported (instead of the fallback)
 * is to add another logo in a PR. 🎉
 */

type WrapperProps<T> = {
  children: React.ChildrenArray<T>,
  outerProps: any,
  width?: number | string,
  height?: number | string,
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

SVGWrapper.defaultProps = {
  width: "100%",
  outerProps: {}
};

export const PythonLogo = () => (
  <SVGWrapper viewBox="0 0 110 110">
    <g color="#000">
      <path
        style={{ marker: "none" }}
        d="M99.75 67.46875C71.718268 67.468752 73.46875 79.625 73.46875 79.625L73.5 92.21875h26.75V96H62.875s-17.9375-2.034276-17.9375 26.25c-.000002 28.28427 15.65625 27.28125 15.65625 27.28125h9.34375v-13.125S69.433848 120.75 85.34375 120.75H111.875s14.90625.24096 14.90625-14.40625V82.125c0-.000002 2.26318-14.65625-27.03125-14.65625zM85 75.9375c2.661429-.000002 4.8125 2.151071 4.8125 4.8125.000002 2.661429-2.151071 4.8125-4.8125 4.8125-2.661429.000002-4.8125-2.151071-4.8125-4.8125-.000002-2.661429 2.151071-4.8125 4.8125-4.8125z"
        overflow="visible"
        transform="translate(-44.9375 -67.46875)"
        fill="var(--logo-off, #387eb8)"
      />
      <path
        style={{ marker: "none" }}
        d="M100.5461 177.31485c28.03174 0 26.28125-12.15625 26.28125-12.15625l-.03125-12.59375h-26.75v-3.78125h37.375s17.9375 2.03427 17.9375-26.25001c.00001-28.284267-15.65625-27.281247-15.65625-27.281247h-9.34375v13.124997s.50366 15.65625-15.40625 15.65625H88.421098s-14.90625-.24096-14.90625 14.40626v24.21875s-2.26318 14.65625 27.031252 14.65625zm14.75-8.46875c-2.66143 0-4.8125-2.15107-4.8125-4.8125s2.15107-4.8125 4.8125-4.8125 4.8125 2.15107 4.8125 4.8125c.00001 2.66143-2.15107 4.8125-4.8125 4.8125z"
        overflow="visible"
        transform="translate(-44.9375 -67.46875)"
        fill="var(--logo-off, #ffe052)"
        fillOpacity="0.7"
      />
    </g>
  </SVGWrapper>
);

export const ScalaLogo = () => (
  <SVGWrapper viewBox="-80 0 416 416">
    <path
      fill="var(--logo-off, black)"
      fillOpacity="0.7"
      d="M0 288v-32c0-5.394 116.377-14.428 192.2-32 36.628 8.49 63.8 18.969 63.8 32v32c0 13.024-27.172 23.51-63.8 32C116.376 302.425 0 293.39 0 288"
      transform="matrix(1 0 0 -1 0 544)"
    />
    <path
      fill="var(--logo-off, black)"
      fillOpacity="0.7"
      d="M0 160v-32c0-5.394 116.377-14.428 192.2-32 36.628 8.49 63.8 18.969 63.8 32v32c0 13.024-27.172 23.51-63.8 32C116.376 174.425 0 165.39 0 160"
      transform="matrix(1 0 0 -1 0 288)"
    />
    <path
      fill="var(--logo-off, #C40000)"
      d="M0 224v-96c0 8 256 24 256 64v96c0-40-256-56-256-64"
      transform="matrix(1 0 0 -1 0 416)"
    />
    <path
      fill="var(--logo-off, #C40000)"
      d="M0 96V0c0 8 256 24 256 64v96c0-40-256-56-256-64"
      transform="matrix(1 0 0 -1 0 160)"
    />
    <path
      fill="var(--logo-off, #C40000)"
      d="M0 352v-96c0 8 256 24 256 64v96c0-40-256-56-256-64"
      transform="matrix(1 0 0 -1 0 672)"
    />
  </SVGWrapper>
);

export const RLogo = () => (
  <SVGWrapper viewBox="0 0 724 561">
    <defs>
      <linearGradient
        id="grayRingForRLogo"
        x2="1"
        y2="1"
        gradientUnits="objectBoundingBox"
      >
        <stop offset="0" stopColor="#CBCED0" />
        <stop offset="1" stopColor="#84838B" />
      </linearGradient>
      <linearGradient
        id="blueRForRLogo"
        x2="1"
        y2="1"
        gradientUnits="objectBoundingBox"
      >
        <stop offset="0" stopColor="#276DC3" />
        <stop offset="1" stopColor="#165CAA" />
      </linearGradient>
    </defs>
    <path
      fill="url(#grayRingForRLogo)"
      fillRule="evenodd"
      d="M361.453 485.937C162.329 485.937.906 377.828.906 244.469.906 111.109 162.329 3 361.453 3 560.578 3 722 111.109 722 244.469c0 133.359-161.422 241.468-360.547 241.468zm55.188-388.531c-151.352 0-274.047 73.908-274.047 165.078s122.695 165.078 274.047 165.078c151.351 0 263.046-50.529 263.046-165.078 0-114.513-111.695-165.078-263.046-165.078z"
    />
    <path
      fill="url(#blueRForRLogo)"
      fillRule="evenodd"
      d="M550 377s21.822 6.585 34.5 13c4.399 2.226 12.01 6.668 17.5 12.5 5.378 5.712 8 11.5 8 11.5l86 145-139 .062L492 437s-13.31-22.869-21.5-29.5c-6.832-5.531-9.745-7.5-16.5-7.5h-33.026L421 558.974l-123 .052V152.938h247S657.5 154.967 657.5 262 550 377 550 377zm-53.5-135.976l-74.463-.048-.037 69.05 74.5-.024s34.5-.107 34.5-35.125c0-35.722-34.5-33.853-34.5-33.853z"
    />
  </SVGWrapper>
);

export const JSLogo = () => (
  <SVGWrapper viewBox="0 0 256 289" preserveAspectRatio="xMidYMid">
    <path
      fill="#539E43"
      d="M127.999999 288.463771c-3.975155 0-7.6853-1.060043-11.130435-2.915115l-35.2463756-20.935818c-5.3002084-2.915114-2.650103-3.975156-1.0600426-4.505177 7.1552801-2.385091 8.4803317-2.915114 15.900623-7.15528.7950291-.53002 1.8550717-.265009 2.650103.265011l27.0310552 16.165632c1.060043.530021 2.385094.530021 3.180126 0l105.739129-61.21739c1.060043-.530023 1.590063-1.590063 1.590063-2.915115V83.0807467c0-1.3250538-.53002-2.3850941-1.590063-2.9151143L129.325053 19.2132506c-1.060043-.5300201-2.385094-.5300201-3.180126 0L20.4057954 80.1656324c-1.0600403.5300202-1.5900605 1.8550717-1.5900605 2.9151143V205.250519c0 1.060041.5300202 2.385092 1.5900605 2.915115l28.8861293 16.695652c15.6356117 7.950309 25.4409949-1.325052 25.4409949-10.600415V93.681159c0-1.5900605 1.3250515-3.1801232 3.1801232-3.1801232h13.5155288c1.5900627 0 3.1801232 1.3250515 3.1801232 3.1801232v120.579712c0 20.935818-11.3954436 33.126293-31.2712211 33.126293-6.0952375 0-10.8654235 0-24.3809523-6.625258l-27.8260867-15.90062C4.24016581 220.886129 0 213.46584 0 205.515528V83.3457557c0-7.9503092 4.24016581-15.3706005 11.1304347-19.3457551L116.869564 2.78260752c6.62526-3.71014336 15.635612-3.71014336 22.260872 0L244.869565 64.0000006C251.759834 67.9751552 256 75.3954465 256 83.3457557V205.515528c0 7.950312-4.240166 15.370601-11.130435 19.345758l-105.739129 61.21739c-3.445137 1.590063-7.420291 2.385095-11.130437 2.385095zm32.596275-84.008283c-46.376813 0-55.917185-21.200829-55.917185-39.221533 0-1.590062 1.325052-3.180123 3.180123-3.180123h13.78054c1.590061 0 2.915112 1.06004 2.915112 2.650103 2.120083 14.045549 8.215323 20.935818 36.306419 20.935818 22.260871 0 31.801243-5.035197 31.801243-16.960663 0-6.890269-2.650103-11.925466-37.366461-15.370601-28.886127-2.915114-46.90683-9.275363-46.90683-32.331263 0-21.4658385 18.020703-34.1863359 48.231884-34.1863359 33.921324 0 50.616976 11.6604571 52.737059 37.1014499 0 .795031-.265011 1.590063-.795031 2.385094-.53002.53002-1.325052 1.06004-2.120083 1.06004h-13.780538c-1.325051 0-2.650103-1.06004-2.915114-2.385092-3.180123-14.575569-11.395446-19.345757-33.126293-19.345757-24.380954 0-27.296066 8.480332-27.296066 14.84058 0 7.685301 3.445134 10.070395 36.306418 14.310561 32.596273 4.240165 47.966873 10.335403 47.966873 33.126292-.265011 23.320912-19.345755 36.57143-53.00207 36.57143z"
    />
  </SVGWrapper>
);

// Create a deterministic number from a string
function hashCode(str: string): number {
  let hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Pick a random color, altering only hue
function pickColor(str: string): string {
  return `hsl(${hashCode(str) % 360}, 100%, 30%)`;
}

// When we don't have a logo for a given language, generate a circle for it
export const PlaceholderLogo = (props: { language: string }) => {
  const strokeColor = pickColor(props.language || "k");

  return (
    <SVGWrapper viewBox="0 0 20 20">
      <g
        stroke={`var(--logo-off, ${strokeColor})`}
        fillOpacity="0"
        strokeWidth="2"
      >
        <circle cx="10" cy="10" r="5" />
      </g>
    </SVGWrapper>
  );
};

export default function Logo({ language }: { language: string }) {
  switch (language.toLowerCase()) {
    case "javascript":
      return <JSLogo />;
    case "r":
      return <RLogo />;
    case "scala":
      return <ScalaLogo />;
    case "python":
      return <PythonLogo />;
    default:
      return <PlaceholderLogo language={language} />;
  }
}

Logo.defaultProps = {
  language: ""
};
