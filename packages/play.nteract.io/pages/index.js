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

function detectPlatform(ctx) {
  if (ctx.req && ctx.req.headers) {
    // Server side
    const ua = ctx.req.headers["user-agent"];
    if (/Windows/.test(ua)) {
      return "Windows";
    } else if (/Linux/.test(ua)) {
      return "Linux";
    }
    // Client side
  } else if (navigator.platform) {
    if (/Win/.test(navigator.platform)) {
      return "Windows";
    } else if (/Linux/.test(navigator.platform)) {
      return "Linux";
    }
  }
  // Else keep macOS default
  return "macOS";
}

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
from vdom import h1, p, img, div, b, span

display(
    div(
        h1('Welcome to play.nteract.io'),
        p('Run Python code via Binder & Jupyter'),
        img(src="https://bit.ly/storybot-vdom"),
        p('Change the code, click ',
            span("▶ Run", style=dict(
                color="white",
                backgroundColor="black",
                padding="10px"
            )),
          ' Up above'
        )
    )
)`,
      outputs: [],
      showPanel: false
    };
  }

  static async getInitialProps(ctx: Context<EmptyQuery>): Promise<OSProps> {
    const platform = detectPlatform(ctx);
    return { platform };
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
      { repo: "binder-examples/jupyter-stacks" },
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
              title={`run cell (${
                this.props.platform === "macOS" ? "⌘-" : "Ctrl-"
              }⏎)`}
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
            options={{
              lineNumbers: true,
              extraKeys: {
                "Ctrl-Enter": this.runSomeCode,
                "Cmd-Enter": this.runSomeCode
              }
            }}
            value={this.state.source}
            language={"python"}
            onChange={this.onEditorChange}
          />
        </div>

        <div className="play-outputs">
          <Outputs>
            <Display outputs={this.state.outputs} expanded />
          </Outputs>
        </div>

        <style jsx>{`
          --header-height: 42px;
          --editor-width: 52%;

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
            padding-right: 20px;
          }
          .kernel {
            color: #888;
          }

          .play-editor {
            width: var(--editor-width);
            position: absolute;
            left: 0;
            height: 100%;
          }

          .play-editor :global(.CodeMirror) {
            height: 100%;
          }

          .play-outputs {
            width: calc(100% - var(--editor-width));
            position: absolute;
            right: 0;
          }

          .play-outputs :global(*) {
            font-family: Monaco, monospace;
          }

          .play-editor > :global(*) {
            height: 100%;
          }
          :global(.CodeMirror) {
            height: 100%;
          }
        `}</style>

        <style jsx global>{`
          body {
            margin: 0;
          }

          /** In development mode, these aren't set right away so we set them
          direct to start off. Same styled-jsx issue we typically run into with
          our lerna app... */
          .CodeMirror {
            height: 100%;
          }
          .CodeMirror-gutters {
            box-shadow: unset;
          }

          .initialTextAreaForCodeMirror {
            font-family: "Source Code Pro", "Monaco", monospace;
            font-size: 14px;
            line-height: 20px;

            height: auto;

            background: none;

            border: none;
            overflow: hidden;

            -webkit-scrollbar: none;
            -webkit-box-shadow: none;
            -moz-box-shadow: none;
            box-shadow: none;
            width: 100%;
            resize: none;
            padding: 10px 0 5px 10px;
            letter-spacing: 0.3px;
            word-spacing: 1px;
          }

          .initialTextAreaForCodeMirror:focus {
            outline: none;
            border: none;
          }
        `}</style>
      </div>
    );
  }
}
