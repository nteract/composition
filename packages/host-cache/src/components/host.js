// @flow
import * as React from "react";

import { LocalHostStorage } from "../host-storage.js";

const { Provider, Consumer } = React.createContext(null);

export { Consumer };

type HostProps = {
  children?: React.Node,
  repo: string,
  gitRef?: string,
  binderURL?: string
};

import type { ServerConfig } from "../host-storage";

class Host extends React.Component<HostProps, ServerConfig> {
  lhs: LocalHostStorage;

  static Consumer = Consumer;

  static defaultProps = {
    repo: "nteract/vdom",
    gitRef: "master",
    binderURL: "https://mybinder.org"
  };

  allocate = () => {
    const binderOpts = {
      repo: this.props.repo,
      gitRef: this.props.gitRef,
      binderURL: this.props.binderURL
    };

    this.lhs
      .allocate(binderOpts)
      .then(host => {
        this.setState(host);
      })
      .catch(e => {
        console.error("seriously say what", e);
      });
  };

  componentDidMount() {
    this.lhs = new LocalHostStorage();
    this.allocate();
  }

  componentWillUnmount() {
    this.lhs.close();
  }

  render() {
    if (!this.props.children) {
      return null;
    }
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

export default Host;
