// We might only need this as a devDependency as it is only here for flow
import { ImmutableOutput } from "@nteract/commutable";
import * as React from "react";

import styled from "styled-components";
interface Props {
  /**
   * React elements that accept Output
   */
  children: React.ReactNode;
  /**
   * The raw output
   */
  output: ImmutableOutput;

  renderError(param: {
    error: Error | null;
    info: ReactErrorInfo;
    output: ImmutableOutput;
    children: React.ReactNode;
  }): React.ReactElement<any>;
}

interface Caught {
  error: Error | null;
  info: ReactErrorInfo;
}

interface State {
  caughtError: Caught | null;
}

interface ReactErrorInfo {
  componentStack: string;
}

const ErrorFallbackDiv = styled.div`
  backgroundcolor: ghostwhite;
  color: black;
  font-weight: 600;
  display: block;
  padding: 10px;
  margin-bottom: 20px;
`;

const ErrorFallback = (caught: Caught) => (
  <ErrorFallbackDiv>
    {caught.error ? <h3>{caught.error.toString()}</h3> : null}
    <details>
      <summary>stack trace</summary>
      <pre>{caught.info.componentStack}</pre>
    </details>
  </ErrorFallbackDiv>
);

export class Output extends React.PureComponent<Props, State> {
  static defaultProps = {
    output: null,
    renderError: ErrorFallback
  };

  readonly state: State = { caughtError: null };

  componentDidCatch(error: Error | null, info: ReactErrorInfo) {
    const caughtError: Caught = {
      error,
      info
    };
    this.setState({
      caughtError
    });
  }

  render() {
    if (this.state.caughtError) {
      return this.props.renderError({
        ...this.state.caughtError,
        output: this.props.output,
        children: this.props.children
      });
    }

    // We must pick only one child to render
    let chosenOne: React.ReactChild | null = null;

    if (this.props.output == null) {
      return null;
    }

    const output_type = this.props.output.output_type;

    // Find the first child element that matches something in this.props.data
    React.Children.forEach(this.props.children, child => {
      if (typeof child === "string" || typeof child === "number") {
        return;
      }

      const childElement = child;
      if (chosenOne) {
        // Already have a selection
        return;
      }

      if (!childElement
        || typeof childElement !== "object"
        || !("props" in childElement)
      ) {
        return;
      }

      if (childElement.props && childElement.props.output_type) {
        const child_output_type: string[] = Array.isArray(
          childElement.props.output_type
        )
          ? childElement.props.output_type
          : [childElement.props.output_type];

        chosenOne = child_output_type.includes(output_type)
          ? childElement
          : null;
        return;
      }
    });

    // If we didn't find a match, render nothing
    if (chosenOne === null) {
      return null;
    }

    // Render the output component that handles this output type
    return React.cloneElement(chosenOne, { output: this.props.output });
  }
}

export default Output;
