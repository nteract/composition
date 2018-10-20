// @flow
import * as React from "react";

const types = {
  ascii: "asciimath",
  tex: "tex"
};

import MathJaxContext, { type MathJaxContextValue } from "./context";

import Provider from "./provider";

type Props = {
  inline: boolean,
  children: string,
  onRender: ?Function
};

class MathJaxNode_ extends React.Component<Props & MathJaxContextValue, null> {
  script: ?HTMLScriptElement;
  nodeRef: React.ElementRef<*>;

  constructor(props: Props & MathJaxContextValue) {
    super(props);

    this.nodeRef = React.createRef();
  }

  /**
   * Render the math once the node is mounted
   */
  componentDidMount() {
    this.typeset();
  }

  /**
   * Update the jax, force update if the display mode changed
   */
  componentDidUpdate(prevProps: Props & MathJaxContextValue) {
    const forceUpdate =
      prevProps.inline !== this.props.inline ||
      prevProps.children !== this.props.children;
    this.typeset(forceUpdate);
  }

  /**
   * Clear the math when unmounting the node
   */
  componentWillUnmount() {
    this.clear();
  }

  /**
   * Clear the jax
   */
  clear() {
    const MathJax = this.props.MathJax;

    if (!MathJax) {
      return;
    }

    if (!this.script) {
      return;
    }

    const jax = MathJax.Hub.getJaxFor(this.script);

    if (jax) {
      jax.Remove();
    }
  }

  /**
   * Update math in the node
   * @param { Boolean } forceUpdate
   */
  typeset(forceUpdate: boolean = false) {
    const { MathJax } = this.props;

    if (!MathJax || !MathJax.Hub) {
      throw Error(
        "Could not find MathJax while attempting typeset! It's likely the MathJax script hasn't been loaded or MathJax.Context is not in the hierarchy."
      );
    }

    const text = this.props.children;

    if (forceUpdate) {
      this.clear();
    }

    if (forceUpdate || !this.script) {
      this.setScriptText(text);
    }

    if (!this.script) return;

    MathJax.Hub.Queue(MathJax.Hub.Reprocess(this.script, this.props.onRender));
  }

  /**
   * Create a script
   * @param { String } text
   */
  setScriptText(text: *) {
    const inline = this.props.inline;
    const type = types[this.props.input];
    if (!this.script) {
      this.script = document.createElement("script");
      this.script.type = `math/${type}; ${inline ? "" : "mode=display"}`;

      this.nodeRef.current.appendChild(this.script);
    }

    // It _should_ be defined at this point, we'll just return at this point now
    if (!this.script) {
      return;
    }

    if ("text" in this.script) {
      // IE8, etc
      this.script.text = text;
    } else {
      this.script.textContent = text;
    }
  }

  render() {
    return <span ref={this.nodeRef} />;
  }
}

class MathJaxNode extends React.Component<Props, null> {
  static defaultProps = {
    inline: false,
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
                <MathJaxNode {...this.props} />
              </Provider>
            );
          }

          if (!MathJax) {
            return null;
          }

          return (
            <MathJaxNode_
              inline={this.props.inline}
              onRender={this.props.onRender}
              input={input}
              MathJax={MathJax}
              hasProviderAbove={hasProviderAbove}
            >
              {this.props.children}
            </MathJaxNode_>
          );
        }}
      </MathJaxContext.Consumer>
    );
  }
}

export default MathJaxNode;
