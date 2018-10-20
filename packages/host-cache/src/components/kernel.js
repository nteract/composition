// @flow
import * as React from "react";
import Host from "./host";

const { Provider, Consumer } = React.createContext(null);

export { Consumer };

import type { ServerConfig } from "../host-storage";

// NOTE: This could use the sessions API so these kernels aren't "on the loose"
import { kernels } from "rx-jupyter";

type KernelAllocatorProps = {
  children?: React.Node,
  host: ServerConfig,
  kernelName: string,
  cwd: string
};

type KernelAllocatorState = {
  channels: Object | null,
  error: boolean
};

class KernelAllocator extends React.Component<
  KernelAllocatorProps,
  KernelAllocatorState
> {
  constructor(props) {
    super(props);
    (this: any).allocate = this.allocate.bind(this);
  }

  allocate() {
    // Set up a closure around the current props, for determining if we should really update state
    const { kernelName, host, cwd } = this.props;
    const { endpoint, token } = this.props.host;

    kernels.start(host, kernelName, cwd).subscribe(
      xhr => {
        this.setState((prevState, currentProps) => {
          // Ensure that the props haven't changed on us midway -- if they have,
          // we shouldn't try to connect to our (now) old kernel
          if (
            currentProps.kernelName !== kernelName ||
            currentProps.cwd !== cwd ||
            currentProps.host.endpoint !== endpoint ||
            currentProps.host.token !== token
          ) {
            console.log(
              "Props changed while in the middle of starting a kernel, assuming that another kernel is starting up"
            );
            return {};
          }
          return {
            channels: kernels.connect(
              host,
              xhr.response.id
            ),
            error: false
          };
        });
      },
      err => {
        console.error(err);
        this.setState({ error: true });
      }
    );
  }

  componentDidMount() {
    // Unequivocally allocate a kernel
    this.allocate();
  }

  componentDidUpdate(prevProps) {
    // Determine if we need to re-allocate a kernel
    if (
      prevProps.kernelName !== this.props.kernelName ||
      prevProps.cwd !== this.props.cwd ||
      prevProps.host.endpoint !== this.props.host.endpoint ||
      prevProps.host.token !== this.props.host.token
    ) {
      this.allocate();
    }
  }

  render() {
    if (!this.props.children) {
      return null;
    }

    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

type KernelProps = {
  children?: React.Node,
  repo: string,
  gitRef?: string,
  binderURL?: string,
  kernelName: string,
  cwd: string
};

class Kernel extends React.Component<KernelProps, null> {
  static Consumer = Consumer;

  static defaultProps = {
    repo: "nteract/vdom",
    gitRef: "master",
    binderURL: "https://mybinder.org",
    kernelName: "python",
    cwd: "/"
  };

  render() {
    if (!this.props.children) {
      return null;
    }

    return (
      // Render the host
      <Host
        repo={this.props.repo}
        gitRef={this.props.gitRef}
        binderURL={this.props.binderURL}
      >
        {/* Once we have a host, we can get a kernel */}
        <Host.Consumer>
          {host =>
            host ? (
              <KernelAllocator
                kernelName={this.props.kernelName}
                cwd={this.props.cwd}
                host={host}
              >
                {this.props.children}
              </KernelAllocator>
            ) : null
          }
        </Host.Consumer>
      </Host>
    );
  }
}

export default Kernel;
