// @flow
import React from "react";

type Props = {
  above: boolean,
  createCell: (type: string) => void,
  mergeCell: () => void
};

import {
  CodeOcticon,
  MarkdownOcticon,
  DownArrowOcticon
} from "@nteract/octicons";

export default (props: Props) => (
  <div className="creator-hover-mask">
    <div className="creator-hover-region">
      <div className="cell-creator">
        <button
          onClick={() => props.createCell("markdown")}
          title="create text cell"
          className="add-text-cell"
        >
          <span className="octicon">
            <MarkdownOcticon />
          </span>
        </button>
        <button
          onClick={() => props.createCell("code")}
          title="create code cell"
          className="add-code-cell"
        >
          <span className="octicon">
            <CodeOcticon />
          </span>
        </button>
        {props.above ? null : (
          <button
            onClick={() => props.mergeCell()}
            title="merge cells"
            className="merge-cell"
          >
            <span className="octicon">
              <DownArrowOcticon />
            </span>
          </button>
        )}
      </div>
    </div>
    <style jsx>{`
      .creator-hover-mask {
        display: block;
        position: relative;
        overflow: visible;
        height: 0px;
      }

      .creator-hover-region {
        position: relative;
        overflow: visible;
        top: -10px;
        height: 60px;
        text-align: center;
      }

      .cell-creator {
        display: none;
        background: var(--main-bg-color, white);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
        pointer-events: all;
        position: relative;
        top: -5px;
      }

      .cell-creator button {
        display: inline-block;

        width: 22px;
        height: 20px;
        padding: 0px 4px;

        text-align: center;

        border: none;
        outline: none;
        background: none;
      }

      .cell-creator button span {
        font-size: 15px;
        line-height: 1;

        color: var(--toolbar-button, #aaa);
      }

      .cell-creator button span:hover {
        color: var(--toolbar-button-hover, #555);
      }

      .creator-hover-region:hover > .cell-creator {
        display: inline-block;
      }

      .octicon {
        transition: color 0.5s;
      }
    `}</style>
  </div>
);
