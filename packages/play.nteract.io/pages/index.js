import * as React from "react";

import { BinderConsole } from "../components/consoles";

const { binder } = require("rx-binder");
const { kernels } = require("rx-jupyter");

const {
  filter,
  map,
  switchMap,
  tap,
  first,
  timeout,
  catchError,
  takeUntil
} = require("rxjs/operators");

const { empty } = require("rxjs/observable/empty");

const { omit } = require("lodash");
const uuid = require("uuid");

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.getServer = this.getServer.bind(this);

    this.state = {
      binderMessages: [],
      kernelMessages: [],
      serverConfig: null,
      error: null
    };
  }

  async kernelLifecycle(kernel) {
    await new Promise(resolve =>
      this.setState({ kernelMessages: [] }, resolve)
    );

    console.log("kicking off kernel");

    kernel.channels.subscribe({
      next: msg => {
        console.log(msg);
      },
      error: err => {
        this.setState({ error: err });
      },
      complete: () => {
        console.log("kernel connection closed");
      }
    });

    kernel.channels.next(
      JSON.stringify({
        header: {
          msg_id: uuid(),
          username: "username",
          session: kernel.session,
          date: new Date().toISOString(),
          msg_type: "kernel_info_request",
          version: "5.2"
        },
        channel: "shell",
        parent_header: {},
        metadata: {},
        content: {},
        buffers: []
      })
    );

    await kernel.channels
      .pipe(filter(m => m.header.msg_type === "status"), first())
      .toPromise();

    const kernelInfoRequest = {
      header: {
        msg_id: uuid(),
        username: "username",
        session: kernel.session,
        date: new Date().toISOString(),
        msg_type: "kernel_info_request",
        version: "5.2"
      },
      channel: "shell",
      parent_header: {},
      metadata: {},
      content: {},
      buffers: []
    };

    // Prep our handler for the kernel info reply
    const kr = kernel.channels
      .pipe(
        filter(m => m.parent_header.msg_id === kernelInfoRequest.header.msg_id),
        filter(m => m.header.msg_type === "kernel_info_reply"),
        first()
      )
      .toPromise();

    kernel.channels.next(JSON.stringify(kernelInfoRequest));

    // Wait for the kernel info reply
    await kr;

    // Prep our handler for the kernel shutdown reply
    const ks = kernel.channels
      .pipe(
        filter(m => m.header.msg_type === "shutdown_reply"),
        first(),
        timeout(100),
        catchError(() => empty())
      )
      .toPromise();

    kernel.channels.next(
      JSON.stringify({
        header: {
          msg_id: uuid(),
          username: "username",
          session: kernel.session,
          date: new Date().toISOString(),
          msg_type: "shutdown_request",
          version: "5.2"
        },
        channel: "shell",
        parent_header: {},
        metadata: {},
        content: {},
        buffers: []
      })
    );

    await ks;

    kernel.channels.complete();

    console.log("** Killing kernel just to make it official **");
    kernels.kill(this.state.serverConfig, kernel.id);
  }

  async getKernel(serverConfig, kernelName = "python3") {
    const session = uuid();

    const kernel = await kernels
      .start(serverConfig, kernelName, "")
      .pipe(
        map(aj => {
          return Object.assign({}, aj.response, {
            session: session,
            channels: kernels.connect(serverConfig, aj.response.id, session)
          });
        })
      )
      .toPromise();

    return kernel;
  }

  async getServer() {
    const serverConfig = await binder(
      { repo: "nteract/vdom" },
      window.EventSource
    )
      .pipe(
        tap(msg => {
          this.setState({
            binderMessages: this.state.binderMessages.concat(msg)
          });
        }),
        filter(msg => msg.phase === "ready"),
        map(msg => {
          const serverConfig = {
            endpoint: msg.url.replace(/\/\s*$/, ""),
            uri: "/",
            token: msg.token,
            crossDomain: true
          };
          return serverConfig;
        }),
        first()
      )
      .toPromise()
      .catch(err => this.setState({ error: err }));

    return serverConfig;
  }

  async initialize() {
    const serverConfig = await this.getServer();
    this.setState({ serverConfig });
    const kernel = await this.getKernel(serverConfig);

    // It would be nice if setState returned a promise instead of a callback but hey
    await new Promise((resolve, reject) => {
      this.setState({ kernel }, resolve);
    });

    await this.kernelLifecycle(kernel);
  }

  componentDidMount() {
    this.initialize();
  }

  render() {
    return (
      <div>
        <BinderConsole
          logs={this.state.binderMessages}
          expanded={!this.state.serverConfig}
        />
        <h2>Server config</h2>
        <pre>{JSON.stringify(this.state.serverConfig, null, 2)}</pre>
        <h3>Kernel config</h3>
        <pre>
          {JSON.stringify(omit(this.state.kernel, "channels"), null, 2)}
        </pre>
        <style jsx global>{`
          body {
            margin: 0;
          }
        `}</style>
      </div>
    );
  }
}
