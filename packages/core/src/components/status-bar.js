/* @flow */
import React from "react";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";

type Props = {
  notebook: any,
  lastSaved: Date,
  kernelSpecDisplayName: string,
  executionState: string
};

export default class StatusBar extends React.Component<Props> {
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

  render(): ?React$Element<any> {
    const name = this.props.kernelSpecDisplayName || "Loading...";

    return (
      <div className="status-bar">
        <span className="pull-right">
          {this.props.lastSaved ? (
            <p> Last saved {distanceInWordsToNow(this.props.lastSaved)} </p>
          ) : (
            <p> Not saved yet </p>
          )}
        </span>
        <span className="pull-left">
          <p>
            {name} | {this.props.executionState}
          </p>
        </span>
        <style jsx>{`
          .status-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            font-size: 12px;
            line-height: 0.5em;
            background: var(--status-bar);
            z-index: 99;
          }

          .pull-right {
            float: right;
            padding-right: 10px;
          }

          .pull-left {
            display: block;
            padding-left: 10px;
          }
        `}</style>
      </div>
    );
  }
}
