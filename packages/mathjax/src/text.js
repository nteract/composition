// @flow
import * as React from "react";

import MathJaxContext, { type MathJaxContextValue } from "./context";
import Provider from "./provider";

type Props = {
  children: string,
  onRender: ?Function
};

class MathJaxText_ extends React.Component<Props & MathJaxContextValue, null> {
  nodeRef: React.ElementRef<*>;

  constructor(props: Props & MathJaxContextValue) {
    super(props);
    this.nodeRef = React.createRef();
  }

  componentDidMount() {
    this.typeset();
  }

  componentDidUpdate() {
    this.typeset();
  }

  typeset() {
    const { MathJax } = this.props;

    if (!MathJax || !MathJax.Hub) {
      throw Error(
        "Could not find MathJax while attempting typeset! It's likely the MathJax script hasn't been loaded or MathJax.Context is not in the hierarchy."
      );
    }

    MathJax.Hub.Queue(
      MathJax.Hub.Typeset(this.nodeRef.current, this.props.onRender)
    );
  }

  render() {
    return <div ref={this.nodeRef}>{this.props.children}</div>;
  }
}

class MathJaxText extends React.Component<Props, null> {
  static defaultProps = {
    onRender: null
  };

  render() {
    return (
      <MathJaxContext.Consumer>
        {({ MathJax, input, hasProviderAbove }: MathJaxContextValue) => {
          // If there is no <Provider /> in the above tree, create our own
          if (!hasProviderAbove) {
            return (
              <Provider>
                <MathJaxText {...this.props} />
              </Provider>
            );
          }

          if (!MathJax) {
            return null;
          }

          return (
            <MathJaxText_
              onRender={this.props.onRender}
              input={input}
              MathJax={MathJax}
              hasProviderAbove={hasProviderAbove}
            >
              {this.props.children}
            </MathJaxText_>
          );
        }}
      </MathJaxContext.Consumer>
    );
  }
}

export default MathJaxText;
