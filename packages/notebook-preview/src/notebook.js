/* @flow */
import React from "react";

import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import { displayOrder, transforms } from "@nteract/transforms";

import Cell from "./cell";

type Props = {
  displayOrder: ImmutableList<any>,
  notebook: any,
  transforms: ImmutableMap<string, any>,
  theme: string
};

export function getLanguageMode(notebook: any): string {
  // The syntax highlighting language should be set in the language info
  // object.  First try codemirror_mode, then name, and fallback on 'null'.
  const language = notebook.getIn(
    ["metadata", "language_info", "codemirror_mode", "name"],
    notebook.getIn(
      ["metadata", "language_info", "codemirror_mode"],
      notebook.getIn(["metadata", "language_info", "name"], "text")
    )
  );
  return language;
}

export class Notebook extends React.PureComponent {
  props: Props;
  createCellElement: (s: string) => ?React.Element<any>;

  static defaultProps = {
    displayOrder,
    transforms
  };

  static contextTypes = {
    store: React.PropTypes.object
  };

  constructor(): void {
    super();
    this.createCellElement = this.createCellElement.bind(this);
  }

  createCellElement(id: string): ?React.Element<any> {
    const cellMap = this.props.notebook.get("cellMap");
    const cell = cellMap.get(id);

    return (
      <div className="cell-container" key={`cell-container-${id}`}>
        <Cell
          key={id}
          id={id}
          cell={cell}
          displayOrder={this.props.displayOrder}
          transforms={this.props.transforms}
          theme={this.props.theme}
          language={getLanguageMode(this.props.notebook)}
        />
      </div>
    );
  }

  render(): ?React.Element<any> {
    if (!this.props.notebook) {
      return <div className="notebook" />;
    }

    const cellOrder = this.props.notebook.get("cellOrder");
    return (
      <div>
        <div className="notebook">
          {cellOrder.map(this.createCellElement)}
        </div>
      </div>
    );
  }
}

export default Notebook;
