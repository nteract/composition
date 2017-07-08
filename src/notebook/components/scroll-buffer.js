/* eslint-disable no-return-assign */
/* @flow */
import React from "react";

type Props = {
  lastCell: any
};

export default class ScrollBuffer extends React.Component {
  props: Props;

  render(): ?React.Element<any> {
    let bufferStyle = {};

    // If the last cell output is empty, let the user scroll that cell to the
    // top of their screen
    if (this.props.lastCell) {
      if (this.props.lastCell.get("outputs").size == 0) {
        bufferStyle = { height: "calc(100vh - 110px)" };
      }
    }

    return <div style={bufferStyle} />;
  }
}
