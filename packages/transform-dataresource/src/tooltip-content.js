// @flow

import * as React from "react";

const TooltipContent = (props: { children: React.Node }) => (
  <React.Fragment>
    <div className="tooltip-content">{props.children}</div>
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
        transform: translate(calc(-50% + 7px), calc(0% + 9px));
      }
      .tooltip-content:before {
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
      }
      .tooltip-content :global(h3) {
        margin: 0 0 10px;
      }
      .tooltip-content :global(p) {
        font-size: 14px;
      }
    `}</style>
  </React.Fragment>
);

export default TooltipContent;
