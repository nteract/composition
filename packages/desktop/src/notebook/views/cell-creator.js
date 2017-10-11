// @flow
import React from "react";

type Props = {
  above: boolean,
  createCell: (type: string) => void,
  mergeCell: () => void
};

export default (props: Props) => (
  <div className="creator-hover-mask">
    <div className="creator-hover-region">
      <div className="cell-creator">
        <button
          onClick={() => props.createCell("markdown")}
          title="create text cell"
          className="add-text-cell"
        >
          <span className="octicon octicon-markdown" />
        </button>
        <button
          onClick={() => props.createCell("code")}
          title="create code cell"
          className="add-code-cell"
        >
          <span className="octicon octicon-code" />
        </button>
        {props.above ? null : (
          <button
            onClick={() => props.mergeCell()}
            title="merge cells"
            className="merge-cell"
          >
            <span className="octicon octicon-arrow-up" />
          </button>
        )}
      </div>
    </div>
  </div>
);
