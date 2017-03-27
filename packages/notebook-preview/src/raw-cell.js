// @flow

import React from "react";

export default class MarkdownCell extends React.PureComponent {
  render(): ?React.Element<any> {
    return (
      <pre>
        {this.props.cell.get("source")}
      </pre>
    );
  }
}
