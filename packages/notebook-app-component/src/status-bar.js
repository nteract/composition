/* @flow strict */
import React from "react";
import { connect } from "react-redux";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import { selectors } from "@nteract/core";
import type { ContentRef, AppState, KernelRef } from "@nteract/core";

type Props = {
  lastSaved: ?Date,
  kernelSpecDisplayName: string,
  kernelStatus: string
};

const NOT_CONNECTED = "not connected";

export class StatusBar extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props): boolean {
    if (
      this.props.lastSaved !== nextProps.lastSaved ||
      this.props.kernelStatus !== nextProps.kernelStatus
    ) {
      return true;
    }
    return false;
  }

  render(): ?React$Element<*> {
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
            {name} | {this.props.kernelStatus}
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

const mapStateToProps = (
  state: AppState,
  ownProps: { contentRef: ContentRef, kernelRef: ?KernelRef }
): Props => {
  const { contentRef, kernelRef } = ownProps;
  const content = selectors.content(state, { contentRef });
  const kernel = kernelRef ? selectors.kernel(state, { kernelRef }) : null;

  const lastSaved = content && content.lastSaved ? content.lastSaved : null;

  const kernelStatus =
    kernel != null && kernel.status != null ? kernel.status : NOT_CONNECTED;

  // TODO: We need kernels associated to the kernelspec they came from
  //       so we can pluck off the display_name and provide it here
  let kernelSpecDisplayName = " ";
  if (kernelStatus === NOT_CONNECTED) {
    kernelSpecDisplayName = "no kernel";
  } else if (kernel != null && kernel.kernelSpecName != null) {
    kernelSpecDisplayName = kernel.kernelSpecName;
  } else if (content != null && content.type === "notebook") {
    kernelSpecDisplayName =
      selectors.notebook.displayName(content.model) || " ";
  }

  return {
    lastSaved,
    kernelStatus,
    kernelSpecDisplayName
  };
};

export default connect(mapStateToProps)(StatusBar);
