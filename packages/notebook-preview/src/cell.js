/* @flow */
/* eslint-disable react/prefer-stateless-function */
import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import CodeCell from "./code-cell";
import MarkdownCell from "./markdown-cell";

export type CellProps = {
  cell: any,
  displayOrder: ImmutableList<any>,
  id: string,
  language: string,
  theme: string,
  transforms: ImmutableMap<string, any>
};

export class Cell extends React.PureComponent {
  props: CellProps;

  render(): ?React.Element<any> {
    const cell = this.props.cell;
    const type = cell.get("cell_type");

    console.log(this.props.displayOrder);

    return (
      <div className={`cell ${type === "markdown" ? "text" : "code"}`}>
        {type === "markdown"
          ? <MarkdownCell
              cell={cell}
              id={this.props.id}
              theme={this.props.theme}
            />
          : <CodeCell
              cell={cell}
              id={this.props.id}
              theme={this.props.theme}
              language={this.props.language}
              displayOrder={this.props.displayOrder}
              transforms={this.props.transforms}
            />}
      </div>
    );
  }
}

export default Cell;
