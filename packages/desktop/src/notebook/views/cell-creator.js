// @flow
import React, { PureComponent } from "react";

type Props = {
  above: boolean,
  createCell: (type: string) => void,
  mergeCell: () => void
};

export default class CellCreator extends PureComponent<Props, *> {
  render(): React$Element<any> {
    return (
      <div className="creator-hover-mask">
        <div className="creator-hover-region">
          <div className="cell-creator">
            <button
              onClick={() => this.props.createCell("markdown")}
              title="create text cell"
              className="add-text-cell"
            >
              <span className="octicon octicon-markdown" />
            </button>
            <button
              onClick={() => this.props.createCell("code")}
              title="create code cell"
              className="add-code-cell"
            >
              <span className="octicon octicon-code" />
            </button>
            {this.props.above ? null : (
              <button
                onClick={() => this.props.mergeCell()}
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
  }
}
