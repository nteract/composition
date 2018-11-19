// @flow
import * as React from "react";

import { ServerConfig, LocalHostStorage } from "../host-storage";

const { Provider, Consumer } = React.createContext<ServerConfig | null>(null);

export { Consumer };

type HostProps = {
  children?: React.ReactNode;
  repo: string;
  gitRef?: string;
  binderURL?: string;
};

class Host extends React.Component<HostProps, ServerConfig> {
  private lhs?: LocalHostStorage;

  static Consumer = Consumer;

  static defaultProps = {
    repo: "nteract/vdom",
    gitRef: "master",
    binderURL: "https://mybinder.org"
  };

  allocate = () => {
    if (!this.lhs) {
      return;
    }

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
    this.lhs!.close();
  }

  render() {
    if (!this.props.children || this.state === null) {
      return null;
    }
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

export default Host;
