// @flow strict

import * as React from "react";
// We might only need this as a devDependency as it is only here for flow
import type OutputType from "@nteract/records";

type Props = {
  /**
   * React elements that accept Output
   */
  children: React.Node,
  /**
   * The raw output, as expected from @nteract/records
   */
  output: OutputType
};

type State = {};

export class Output extends React.Component<Props, State> {
  static defaultProps = {
    output: null
  };

  render() {
    // We must pick only one child to render
    let chosenOne = null;

    if (this.props.output == null) {
      return null;
    }

    const outputType = this.props.output.outputType;

    // Find the first child element that matches something in this.props.data
    React.Children.forEach(this.props.children, child => {
      if (chosenOne) {
        // Already have a selection
        return;
      }
      if (
        child.props &&
        child.props.outputType &&
        child.props.outputType === outputType
      ) {
        chosenOne = child;
        return;
      }
    });

    // If we didn't find a match, render nothing
    if (chosenOne === null) {
      return null;
    }

    // Render the output component that handles this output type
    return React.cloneElement(chosenOne, this.props.output);
  }
}
