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
      source: `from IPython.display import display
from vdom import h1, p, img, div, b

display(
    div(
        h1('Our Incredibly Declarative Example'),
        p('Can you believe we wrote this ', b('in Python'), '?'),
        img(src="https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif"),
        p('What will ', b('you'), ' create next?'),
    )
)`,
      outputs: [],
      showPanel: false
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

    const message = executeRequest(this.state.source);

    this.state.kernel.channels.next(message);
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

    kernel.channels.next(kernelInfoRequest());

    await kernel.channels.pipe(ofMessageType("status"), first()).toPromise();

    const kir = kernelInfoRequest();

    // Prep our handler for the kernel info reply
    const kr = kernel.channels
      .pipe(childOf(kir), ofMessageType("kernel_info_reply"), first())
      .toPromise();

    kernel.channels.next(kernelInfoRequest());

    await kr;
  }

  async getKernel(serverConfig, kernelName = "python3") {
    const session = uuid();

    const kernel = await kernels
      .start(serverConfig, kernelName, "")
      .pipe(
        map(aj => {
          const kernel = aj.response;
          const wsSubject = kernels.connect(serverConfig, kernel.id, session);

          return Object.assign({}, kernel, {
            channels: wsSubject
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
        <header>
          <div className="left">
            <img
              src="https://media.githubusercontent.com/media/nteract/logos/master/nteract_logo_cube_book/exports/images/svg/nteract_logo_wide_purple_inverted.svg"
              alt="nteract logo"
              className="nteract-logo"
            />

            <button
              onClick={this.runSomeCode}
              className="play"
              disabled={!this.state.kernel}
            >
              ▶ Run
            </button>
            <button
              onClick={() =>
                this.setState({ showPanel: !this.state.showPanel })
              }
            >
              {this.state.showPanel ? "Hide" : "Show"} logs
            </button>
          </div>

          <div className="kernel-data">
            <div className="kernelInfo">
              <span className="kernel">Runtime: </span>
              {this.state.kernelStatus}
            </div>
          </div>
        </header>

        {this.state.showPanel ? (
          <BinderConsole logs={this.state.binderMessages} />
        ) : null}

        <div className="play-editor">
          <CodeMirrorEditor
            value={this.state.source}
            language={"python"}
            onChange={this.onEditorChange}
          />
        </div>

        <div className="play-outputs">
          <Outputs>
            <Display outputs={this.state.outputs} />
          </Outputs>
        </div>

        <style jsx>{`
          --header-height: 42px;

          header {
            display: flex;
            justify-content: space-between;
            background-color: black;
          }

          header img {
            height: calc(var(--header-height) - 16px);
            width: 80px;
            margin-left: 10px;
          }

          header img,
          header button,
          header div {
            vertical-align: middle;
          }

          header button {
            padding: 0px 16px;
            border: none;
            outline: none;
            border-radius: unset;
            background-color: rgba(0, 0, 0, 0);
            color: white;
            height: var(--header-height);
          }

          header button:active,
          header button:focus {
            background-color: rgba(255, 255, 255, 0.1);
          }

          header button:hover {
            background-color: rgba(255, 255, 255, 0.2);
            color: #d7d7d7;
          }

          header button:disabled {
            background-color: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.1);
          }

          header img {
            padding: 0px 20px 0px 10px;
          }

          .kernelInfo {
            color: #f1f1f1;
            line-height: var(--header-height);
            font-family: Monaco, monospace, system-ui;
            font-size: 12px;
            white-space: pre-wrap;
            word-wrap: break-word;
            vertical-align: middle;
            display: table-cell;
            padding-right: 10px;
          }
          .kernel {
            color: #888;
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
