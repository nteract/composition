/* @flow */
/* eslint-disable react/prefer-stateless-function */
import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import CodeCell from "./code-cell";
import MarkdownCell from "./markdown-cell";
import RawCell from "./raw-cell";

export type CellProps = {
  cell: any,
  displayOrder: Array<string>,
  id: string,
  language: string,
  theme: string,
  tip: boolean,
  transforms: ImmutableMap<string, any>,
  sourceHidden: boolean
};

export class Cell extends React.PureComponent {
  props: CellProps;

  render(): ?React.Element<any> {
    const cell = this.props.cell;
    const type = cell.get("cell_type");

    return (
      <div className={`cell ${type === "markdown" ? "text" : "code"}`}>
        {(() => {
          switch (type) {
            case "markdown":
              return (
                <MarkdownCell
                  cell={cell}
                  id={this.props.id}
                  theme={this.props.theme}
                />
              );
            case "code":
              return (
                <CodeCell
                  cell={cell}
                  id={this.props.id}
                  theme={this.props.theme}
                  tip={this.props.tip}
                  language={this.props.language}
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  sourceHidden={this.props.sourceHidden}
                />
              );
            case "raw":
              return <RawCell cell={cell} />;
            default:
              return <RawCell cell={cell} />;
          }
          // This is a bit IIFE
        })()}
      </div>
    );
  }
}

export default Cell;
