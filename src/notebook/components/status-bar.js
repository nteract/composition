/* @flow */
import React from "react";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import moment from "moment";
import * as path from "path";
import { remote } from "electron";
import * as git from "git-utils";

type Props = {
  fPath: string,
  notebook: any,
  lastSaved: Date,
  kernelSpecDisplayName: string,
  executionState: string
};

let branch = "";
let cwd = "";

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
    const cwd = path.dirname(this.props.fPath);

    git.open(cwd) && git.open(cwd).getShortHead() != null
      ? (branch = git.open(cwd).getShortHead() + " | ")
      : (branch = " | ");

    return (
      <div className="status-bar">
        <span className="pull-right">
          {this.props.lastSaved
            ? <p>
                <span className="octicon octicon-git-branch" />{branch}
                Last saved {moment(this.props.lastSaved).fromNow()}{" "}
              </p>
            : <p>
                <span className="octicon octicon-git-branch" />{branch}
                Not saved yet{" "}
              </p>}
        </span>
        <span className="pull-left">
          <p>
            {name} | {this.props.executionState}
          </p>
        </span>
      </div>
    );
  }
}
