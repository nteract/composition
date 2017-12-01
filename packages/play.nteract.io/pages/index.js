import * as React from "react";

import CodeMirrorEditor from "@nteract/editor";
import { Display } from "@nteract/display-area";
import {
  executeRequest,
  kernelInfoRequest,
  childOf,
  ofMessageType
} from "@nteract/messaging";

// TODO: finish making these our top level components
import { _nextgen } from "@nteract/core/components";

const {
  Cell,
  Input,
  Prompt,
  PromptBuffer,
  Editor,
  Outputs,
  Notebook
} = _nextgen;

import { Header } from "../components/header";
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

const uuid = require("uuid");

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.getServer = this.getServer.bind(this);
    this.runSomeCode = this.runSomeCode.bind(this);
    this.onEditorChange = this.onEditorChange.bind(this);

    this.state = {
      binderMessages: [],
      kernelMessages: [],
      serverConfig: null,
      kernelStatus: "provisioning",
      kernel: null,
      error: null,
      source: `from vdom import h1
h1('woo')`,
      outputs: []
    };
  }

  onEditorChange(source) {
    this.setState({ source });
  }

  async runSomeCode() {
    if (!this.state.kernel) {
      return;
    }

    await new Promise(resolve => this.setState({ outputs: [] }, resolve));

    const message = executeRequest(
      this.state.source,
      {},
      { session: this.state.kernel.session }
    );

    this.state.kernel.channels.next(JSON.stringify(message));
  }

  async kernelLifecycle(kernel) {
    await new Promise(resolve =>
      this.setState({ kernelMessages: [] }, resolve)
    );

    kernel.channels.subscribe({
      next: msg => {
        this.setState({
          kernelMessages: this.state.kernelMessages.concat(msg)
        });
        switch (msg.header.msg_type) {
          case "status":
            this.setState({ kernelStatus: msg.content.execution_state });
            break;
          case "display_data":
          case "execute_result":
          case "stream":
          case "error":
            const output = Object.assign({}, msg.content, {
              output_type: msg.header.msg_type
            });
            this.setState({ outputs: this.state.outputs.concat(output) });
        }
      },
      error: err => {
        this.setState({ error: err });
      },
      complete: () => {
        console.log("kernel connection closed");
      }
    });

    kernel.channels.next(
      JSON.stringify(kernelInfoRequest({ session: kernel.session }))
    );

    await kernel.channels.pipe(ofMessageType("status"), first()).toPromise();

    const kir = kernelInfoRequest({ session: kernel.session });

    // Prep our handler for the kernel info reply
    const kr = kernel.channels
      .pipe(childOf(kir), ofMessageType("kernel_info_reply"), first())
      .toPromise();

    kernel.channels.next(JSON.stringify(kernelInfoRequest));

    await kr;
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
        <Header kernelStatus={this.state.kernelStatus} />
        <BinderConsole
          logs={this.state.binderMessages}
          expanded={!this.state.serverConfig}
        />

        {this.state.kernel ? (
          <button onClick={this.runSomeCode} className="play">
            ▶
          </button>
        ) : null}

        <div className="play-editor">
          <CodeMirrorEditor
            tip
            completion
            // id={this.props.id}
            value={this.state.source}
            language={"python"}
            onChange={this.onEditorChange}
            // NOTE: A bunch of these are very notebook specific
            // cellFocused={cellFocused}
            // editorFocused={editorFocused}
            // theme={this.props.theme}
            // focusAbove={this.focusAboveCell}
            // focusBelow={this.focusBelowCell}
          />
        </div>

        <div className="play-outputs">
          <Outputs>
            <Display outputs={this.state.outputs} />
          </Outputs>
        </div>

        <style jsx>{`
          .play {
            border: none;
            font-size: 50px;

            outline: none;

            text-transform: none;
            overflow: visible;
            margin: 0;

            display: inline-block;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            padding: 0 10px;
            vertical-align: middle;
            font-size: 14px;
            min-width: 30px;
            min-height: 30px;
            line-height: 30px;

            box-shadow: inset 0 0 0 1px rgba(16, 22, 26, 0.2),
              inset 0 -1px 0 rgba(16, 22, 26, 0.1);
            background-color: #f8f8fa;
            background-image: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.8),
              rgba(255, 255, 255, 0)
            );
            color: #181818;
          }

          .play:active {
            box-shadow: inset 0 0 0 1px rgba(16, 22, 26, 0.2),
              inset 0 1px 2px rgba(16, 22, 26, 0.2);
            background-color: #d8d8d8;
            background-image: none;
          }

          .play:hover {
            box-shadow: inset 0 0 0 1px rgba(16, 22, 26, 0.2),
              inset 0 -1px 0 rgba(16, 22, 26, 0.1);
            background-clip: padding-box;
            background-color: #ebebeb;
          }

          .play-editor {
            width: 50%;
            position: absolute;
            left: 0;
            height: 100%;
          }

          .play-outputs {
            width: 50%;
            position: absolute;
            right: 0;
            height: 100%;
          }

          .play-outputs :global(*) {
            font-family: Monaco, monospace;
          }

          .play-editor > :global(*) {
            height: 100%;
          }
        `}</style>

        <style jsx global>{`
          body {
            margin: 0;
          }
        `}</style>
      </div>
    );
  }
}
