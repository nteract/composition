// @flow
import * as React from "react";
import PropTypes from "prop-types";

const types = {
  ascii: "asciimath",
  tex: "tex"
};

type Props = {
  inline: boolean,
  children: string,
  onRender: ?Function
};

class Node extends React.Component<Props, *> {
  script: ?HTMLScriptElement;
  nodeRef: React.ElementRef<*>;

  static defaultProps = {
    inline: false,
    onRender: null
  };

  constructor(props: Props) {
    super(props);

    this.nodeRef = React.createRef();

    (this: any).typeset = this.typeset;
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
  componentDidUpdate(prevProps: Props) {
    const forceUpdate =
      prevProps.inline !== this.props.inline ||
      prevProps.children !== this.props.children;
    this.typeset(forceUpdate);
  }

  /**
   * Prevent update when the source has not changed
   */
  shouldComponentUpdate(nextProps: Props, nextState: *, nextContext: *) {
    return (
      nextProps.children !== this.props.children ||
      nextProps.inline !== this.props.inline
    );
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
    const MathJax = this.context.MathJax;

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
    const { MathJax } = this.context;

    if (!MathJax) {
      throw Error(
        "Could not find MathJax while attempting typeset! It's likely the MathJax script hasn't been loaded or MathJax.Context is not in the hierarchy"
      );
    }

    const text = this.props.children;

    if (forceUpdate) {
      this.clear();
    }

    if (forceUpdate || !this.script) {
      this.setScriptText(text);
    }

    MathJax.Hub.Queue(MathJax.Hub.Reprocess(this.script, this.props.onRender));
  }

  /**
   * Create a script
   * @param { String } text
   */
  setScriptText(text: *) {
    const inline = this.props.inline;
    const type = types[this.context.input];
    if (!this.script) {
      this.script = document.createElement("script");
      this.script.type = `math/${type}; ${inline ? "" : "mode=display"}`;

      this.nodeRef.current.appendChild(this.script);
    }

    // It _should_ be defined at this point, we'll let Flow handle well here
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

Node.contextTypes = {
  MathJax: PropTypes.object,
  input: PropTypes.string
};
export default Node;
