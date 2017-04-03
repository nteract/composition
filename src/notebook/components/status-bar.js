/* @flow */
import React from "react";
import moment from "moment";

type Props = {
  notebook: any,
  lastSaved: Date,
  kernelSpecDisplayName: string,
  executionState: string
};

export default class StatusBar extends React.Component {
  props: Props;

  shouldComponentUpdate(nextProps: Props): boolean {
    if (
      this.props.notebook !== nextProps.notebook ||
      this.props.lastSaved !== nextProps.lastSaved ||
      this.props.executionState !== nextProps.executionState
    ) {
      return true;
    }
    return false;
  }

  render(): ?React.Element<any> {
    const name = this.props.kernelSpecDisplayName || "Loading...";

    return (
      <div className="status-bar">
        <span className="pull-right">
          {this.props.lastSaved
            ? <p> Last saved {moment(this.props.lastSaved).fromNow()} </p>
            : <p> Not saved yet </p>}
        </span>
        <span className="pull-left">
          <p>{name} | {this.props.executionState}</p>
        </span>
      </div>
    );
  }
}
