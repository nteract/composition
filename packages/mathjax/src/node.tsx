import * as React from "react";

const types = {
  ascii: "asciimath",
  tex: "tex"
};

import MathJaxContext, { MathJaxContextValue } from "./context";
import Provider from "./provider";

interface Props {
  inline: boolean;
  children: string;
  onRender?: () => void;
}

export class MathJaxNode_ extends React.Component<Props & MathJaxContextValue> {
  script?: HTMLScriptElement;
  nodeRef: React.RefObject<HTMLSpanElement>;

  constructor(props: Props & MathJaxContextValue) {
    super(props);

    this.nodeRef = React.createRef();

    this.typeset = this.typeset.bind(this);
    this.clear = this.clear.bind(this);
  }

  /**
   * Render the math once the node is mounted
   */
  componentDidMount() {
    setTimeout(() => this.typeset(), 0);
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

    if (!this.script) {
      return;
    }

    const reprocess = ["Reprocess", MathJax.Hub, this.script];

    if (!this.props.onRender) {
      MathJax.Hub.Queue(reprocess);
    } else {
      MathJax.Hub.Queue(reprocess, this.props.onRender);
    }
  }

  /**
   * Create a script
   * @param { String } text
   */
  setScriptText(text: string) {
    const inline = this.props.inline;
    const type = types[this.props.input];
    if (!this.script) {
      this.script = document.createElement("script");
      this.script.type = `math/${type}; ${inline ? "" : "mode=display"}`;

      this.nodeRef.current!.appendChild(this.script);
    }

    // It _should_ be defined at this point, we'll just return at this point now
    if (!this.script) {
      return;
    }

    this.script.text = text;
  }

  render() {
    return <span ref={this.nodeRef} />;
  }
}

export default class MathJaxNode extends React.PureComponent<Props> {
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
