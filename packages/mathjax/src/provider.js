// @flow strict

import * as React from "react";

import loadScript from "./load-script";
import MathJaxContext, {
  type MathJaxObject, // eslint-disable-line no-unused-vars
  type MathJaxContextValue
} from "./context.js";

// MathJax expected to be a global and may be undefined
declare var MathJax: ?MathJaxObject;

type Props = {
  src: ?string,
  children: React.Node,
  didFinishTypeset: ?() => void,
  onLoad: ?() => void,
  input: "ascii" | "tex",
  delay: number,
  options: ?*,
  loading: React.Node,
  noGate: boolean,
  onError: (err: Error) => void
};

type State = MathJaxContextValue;

/**
 * MathJax Provider
 */
class Provider extends React.Component<Props, State> {
  static defaultProps = {
    src:
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML",
    input: "tex",
    didFinishTypeset: null,
    delay: 0,
    options: {},
    loading: null,
    noGate: false,
    onLoad: null,
    onError: (err: Error) => {
      console.error(err);
    }
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      MathJax: undefined,
      input: this.props.input,
      hasProviderAbove: true
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (state.input !== props.input) {
      return { ...state, input: props.input };
    }
    return null;
  }

  componentDidMount() {
    const src = this.props.src;

    if (src == null) {
      return this.onLoad();
    }
    if (typeof MathJax === "undefined" || !MathJax || !MathJax.Hub) {
      return loadScript(src, this.onLoad);
    }
    this.onLoad();
  }

  onLoad = () => {
    if (typeof MathJax === "undefined" || !MathJax || !MathJax.Hub) {
      this.props.onError(
        new Error("MathJax not really loaded even though onLoad called")
      );
      return;
    }

    const options = this.props.options;
    if (options != null && Object.keys(options).length > 0) {
      MathJax.Hub.Config(options);
    }

    MathJax.Hub.Register.StartupHook("End", () => {
      if (typeof MathJax === "undefined" || !MathJax) {
        this.props.onError(
          new Error("MathJax became undefined in the middle of processing")
        );
        return;
      }
      MathJax.Hub.processSectionDelay = this.props.delay;

      if (this.props.didFinishTypeset) {
        this.props.didFinishTypeset();
      }

      this.setState({
        MathJax
      });
    });

    MathJax.Hub.Register.MessageHook("Math Processing Error", message => {
      if (this.props.onError) {
        this.props.onError(new Error(message));
      }
    });

    if (this.props.onLoad) {
      this.props.onLoad();
    }
  };

  render() {
    return (
      <MathJaxContext.Provider value={this.state}>
        {this.props.children}
      </MathJaxContext.Provider>
    );
  }
}

export default Provider;
