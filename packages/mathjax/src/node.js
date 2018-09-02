/* @flow */
/* global document */
import * as React from "react";
import MathJaxContext, { type MathJaxContextValue } from "./context";
import process from "./process";

class NodeWithMathJax extends React.Component<*, *> {
  props: {
    MathJax: ?Object,
    formula: string,
    inline?: boolean,
    onRender?: () => void
  };
  script: ?HTMLScriptElement;

  static defaultProps = {
    inline: false,
    onRender: () => {}
  };

  /*
     * Render the math once the node is mounted
     */
  componentDidMount() {
    this.typeset();
  }

  /*
     * Update the jax, force update if the display mode changed.
     */
  componentDidUpdate(prevProps: *) {
    const forceUpdate = prevProps.inline != this.props.inline;
    this.typeset(forceUpdate);
  }

  /*
     * Clear the math when unmounting the node
     */
  componentWillUnmount() {
    this.clear();
  }

  container = React.createRef();

  /*
     * Clear the jax
     */
  clear() {
    const { MathJax } = this.props;

    if (!this.script || !MathJax) {
      return;
    }

    const jax = MathJax.Hub.getJaxFor(this.script);
    if (jax) {
      jax.Remove();
    }
  }

  /*
     * Update math in the node.
     */
  typeset(forceUpdate) {
    const { MathJax, formula, onRender } = this.props;

    if (!MathJax) {
      return;
    }

    if (forceUpdate) {
      this.clear();
    }

    if (!forceUpdate && this.script) {
      MathJax.Hub.Queue(() => {
        const jax = MathJax.Hub.getJaxFor(this.script);

        if (jax) jax.Text(formula, onRender);
        else {
          const script = this.setScriptText(formula);
          process(MathJax, script, onRender);
        }
      });
    } else {
      const script = this.setScriptText(formula);
      process(MathJax, script, onRender);
    }
  }

  /*
     * Create a script.
     */
  setScriptText(text: string): HTMLScriptElement {
    const { inline } = this.props;

    if (!this.script) {
      this.script = document.createElement("script");
      this.script.type = `math/tex; ${inline ? "" : "mode=display"}`;
      this.container.current.appendChild(this.script);
    }

    if ("text" in this.script) {
      // IE8, etc
      this.script.text = text;
    } else {
      this.script.textContent = text;
    }

    return this.script;
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { MathJax, formula, inline, onRender, ...rest } = this.props;

    if (this.props.inline) {
      return <span ref={this.container} {...rest} />;
    }

    return <div ref={this.container} {...rest} />;
  }
}

class MathJaxNode extends React.PureComponent<*, *> {
  render() {
    return (
      <MathJaxContext.Consumer>
        {({ MathJax, registerNode }: MathJaxContextValue) => {
          registerNode();

          if (!MathJax) {
            return null;
          }

          return <NodeWithMathJax {...this.props} MathJax={MathJax} />;
        }}
      </MathJaxContext.Consumer>
    );
  }
}

export default MathJaxNode;
