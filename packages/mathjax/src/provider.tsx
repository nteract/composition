import * as React from "react";

import loadScript from "load-script";
import MathJaxContext, { MathJaxContextValue, MathJaxObject } from "./context";

// MathJax expected to be a global and may be undefined
declare var MathJax: MathJaxObject | undefined;

interface Props {
  src?: string;
  children: React.ReactNode;
  input: "ascii" | "tex";
  delay: number;
  options: object;
  loading: React.ReactNode;
  noGate: boolean;
  didFinishTypeset?(): void;
  onLoad?(): void;
  onError(err: Error): void;
}

type State = MathJaxContextValue;

/**
 * MathJax Provider
 */
export default class Provider extends React.Component<Props, State> {
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

  static getDerivedStateFromProps(props: Props, state: State) {
    if (state.input !== props.input) {
      return { ...state, input: props.input };
    }
    return null;
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      MathJax: undefined,
      input: this.props.input,
      hasProviderAbove: true
    };
  }

  componentDidMount() {
    const src = this.props.src;

    if (src === undefined) {
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
    });

    MathJax.Hub.Register.MessageHook(
      "Math Processing Error",
      (message: string) => {
        if (this.props.onError) {
          this.props.onError(new Error(message));
        }
      }
    );

    if (this.props.onLoad) {
      this.props.onLoad();
    }

    this.setState({
      MathJax
    });
  };

  render() {
    return (
      <MathJaxContext.Provider value={this.state}>
        {this.props.children}
      </MathJaxContext.Provider>
    );
  }
}
