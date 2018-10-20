// @flow strict

import * as React from "react";

import type { MediaBundle } from "@nteract/records";

/** Error handling types */
type ReactErrorInfo = {
  componentStack: string
};

type Caught = {
  error: Error,
  info: ReactErrorInfo
};

type RichMediaProps = {
  /**
   * Object of media type → data
   *
   * E.g.
   *
   * ```js
   * {
   *   "text/plain": "raw text",
   * }
   * ```
   *
   * See [Jupyter message spec](http://jupyter-client.readthedocs.io/en/stable/messaging.html#display-data)
   * for more detail.
   *
   */
  data: MediaBundle,
  /**
   * custom settings, typically keyed by media type
   */
  metadata: {},
  /**
   * React elements that accept mimebundle data, will get passed data[mimetype]
   */
  children: React.Node,

  renderError: ({
    error: Error,
    info: ReactErrorInfo,
    data: MediaBundle,
    metadata: {},
    children: React.Node
  }) => React.Element<*>
};

/* We make the RichMedia component an error boundary in case of any <Media /> component erroring */
type State = {
  caughtError?: Caught
};

const ErrorFallback = (caught: Caught) => (
  <div
    style={{
      backgroundColor: "ghostwhite",
      color: "black",
      fontWeight: "600",
      display: "block",
      padding: "10px",
      marginBottom: "20px"
    }}
  >
    <h3>{caught.error.toString()}</h3>
    <details>
      <summary>stack trace</summary>
      <pre>{caught.info.componentStack}</pre>
    </details>
  </div>
);

export class RichMedia extends React.Component<RichMediaProps, State> {
  static defaultProps = {
    data: {},
    metadata: {},
    renderError: ErrorFallback
  };

  state = {};

  componentDidCatch(error: Error, info: ReactErrorInfo) {
    this.setState({ caughtError: { error, info } });
  }

  render() {
    if (this.state.caughtError) {
      return this.props.renderError({
        ...this.state.caughtError,
        ...this.props
      });
    }

    // We must pick only one child to render
    let chosenOne = null;

    const data = this.props.data;

    // Find the first child element that matches something in this.props.data
    React.Children.forEach(this.props.children, child => {
      if (chosenOne) {
        // Already have a selection
        return;
      }
      if (
        child.props &&
        child.props.mediaType &&
        child.props.mediaType in data
      ) {
        chosenOne = child;
        return;
      }
    });

    // If we didn't find a match, render nothing
    if (chosenOne === null) {
      return null;
    }

    const mediaType = chosenOne.props.mediaType;

    return React.cloneElement(chosenOne, {
      data: this.props.data[mediaType],
      metadata: this.props.metadata[mediaType]
    });
  }
}
