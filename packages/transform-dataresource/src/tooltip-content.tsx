// @flow

import * as React from "react";

const TooltipContent = (props: {
  children: React.ReactNode;
  x: number;
  y: number;
}) => {
  const { x, y } = props;

  const translateX = x < 100 ? "0px" : "calc(-50% + 7px)";
  const translateY = y < 100 ? "10px" : "calc(-100% - 10px)";

  const transform = `translate(${translateX}, ${translateY})`;
  const beforeContent =
    x < 100
      ? ""
      : y < 100
      ? `.tooltip-content:before {
    border-left: inherit;
    border-top: inherit;
    top: -8px;
    left: calc(50% - 15px);
    background: inherit;
    content: "";
    padding: 0px;
    transform: rotate(45deg);
    width: 15px;
    height: 15px;
    position: absolute;
    z-index: 99;
  }`
      : `.tooltip-content:before {
    border-right: inherit;
    border-bottom: inherit;
    bottom: -8px;
    left: calc(50% - 15px);
    background: inherit;
    content: "";
    padding: 0px;
    transform: rotate(45deg);
    width: 15px;
    height: 15px;
    position: absolute;
    z-index: 99;
  }`;

  return (
    <React.Fragment>
      <div className="tooltip-content" style={{ transform }}>
        {props.children}
      </div>
      <style jsx>{`
        .tooltip-content {
          color: black;
          padding: 10px;
          z-index: 999999;
          min-width: 120px;
          background: white;
          border: 1px solid #888;
          border-radius: 5px;
          position: relative;
        }
        ${beforeContent} .tooltip-content :global(h3) {
          margin: 0 0 10px;
        }
        .tooltip-content :global(p) {
          font-size: 14px;
        }
      `}</style>
    </React.Fragment>
  );
};

export default TooltipContent;
