// @flow
import * as React from "react";
import Head from "next/head";
import Router from "next/router";
import CodeMirrorEditor from "@nteract/editor";
import { Display } from "@nteract/display-area";
import { Outputs } from "@nteract/presentational-components";
import { connect } from "react-redux";
import objectPath from "object-path";

import { actions } from "../redux";
import * as utils from "../utils";

import { KernelUI } from "./kernelUI";
import { BinderConsole } from "./consoles";

const noop = () => {};

const NTERACT_LOGO_URL =
  "https://media.githubusercontent.com/media/nteract/logos/master/nteract_logo_cube_book/exports/images/svg/nteract_logo_wide_purple_inverted.svg";

class Main extends React.Component<*, *> {
  constructor(props) {
    super(props);
    this.state = {
      gitrefValue: props.gitref,
      repoValue: props.repo,
      sourceValue: props.source
    };
  }
  componentDidMount() {
    const { activateServer } = this.props;
    const { gitrefValue: gitref, repoValue: repo } = this.state;
    const serverId = utils.makeServerId({ gitref, repo });
    activateServer({ serverId, repo, gitref });
  }

  componentDidUpdate(prevProps) {
    // When the gitref or repo change, update the URL params
    if (
      this.props.gitref !== prevProps.gitref ||
      this.props.repo !== prevProps.repo
    ) {
      const newLocation = {
        pathname: Router.pathname,
        query: {
          gitref: this.props.gitref,
          repo: this.props.repo
        }
      };

      Router.push(
        // We have to specify both the `href` (what it really is)
        newLocation,
        // and what location we want the users to see `as`
        newLocation,
        // in order to change the URL without running getInitialProps
        // ref: https://github.com/zeit/next.js#shallow-routing
        { shallow: true }
        // While still providing something that is copy-pastable in the URL bar
      );
    }
  }

  handleEditorChange = source => {
    this.setState({ sourceValue: source });
  };
  handleRepoChange = event => {
    this.setState({ repoValue: event.target.value });
  };
  handleGitrefChange = event => {
    this.setState({ gitrefValue: event.target.value });
  };
  handleKernelChange = event => {
    const { currentServerId: serverId, setActiveKernel } = this.props;
    setActiveKernel({ serverId, kernelName: event.target.value });
  };
  killKernel = kernelName => {
    const { serverId, killKernel } = this.props;
    killKernel({ serverId, kernelName });
  };
  restartKernel = kernelName => {
    const { serverId, restartKernel } = this.props;
    restartKernel({ serverId, kernelName });
  };
  handleFormSubmit = event => {
    const {
      currentServerId: oldServerId,
      activateServer,
      submitBinderForm
    } = this.props;
    const { gitrefValue: gitref, repoValue: repo } = this.state;
    event.preventDefault();
    const serverId = utils.makeServerId({ gitref, repo });

    activateServer({ gitref, repo, serverId, oldServerId });
    submitBinderForm({ gitref, repo });
  };
  handleSourceSubmit = () => {
    const { currentServerId, currentKernelName, runSource } = this.props;
    const { sourceValue: source } = this.state;
    runSource({
      serverId: currentServerId,
      kernelName: currentKernelName,
      source
    });
  };
  handlePanelToggle = () => this.props.setShowPanel(!this.props.showPanel);
  render() {
    const {
      currentKernel,
      codeMirrorMode,
      currentKernelName,
      currentServer,
      platform,
      showPanel,
    } = this.props;
    const { repoValue, gitrefValue, sourceValue } = this.state;
    return (
      <React.Fragment>
        <Head>
          <link rel="dns-prefetch" href="https://mybinder.org" />
          <link
            rel="prefetch"
            href="https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0"
          />
          {/*
            prefetch our little sample graphic for an extra touch of ✨
          */}
          <link rel="prefetch" href="https://bit.ly/storybot-vdom" />
          <link
            rel="prefetch"
            href="https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif"
          />
          <title>nteract play: Run interactive code</title>
        </Head>
        <header>
          <div className="left">
            <img
              src={NTERACT_LOGO_URL}
              alt="nteract logo"
              className="nteract-logo"
            />

            <button
              onClick={this.handleSourceSubmit}
              className="play"
              disabled={!currentKernel}
              title={`run cell (${platform === "macOS" ? "⌘-" : "Ctrl-"}⏎)`}
            >
              ▶ Run
            </button>
            <button onClick={this.handlePanelToggle}>
              {showPanel ? "Hide" : "Show"} logs
            </button>
          </div>
          {currentServer && currentKernel ? (
            <KernelUI
              status={currentKernel.status}
              kernelspecs={
                currentServer.kernelSpecs &&
                currentServer.kernelSpecs.kernelSpecByKernelName
                  ? currentServer.kernelSpecs.kernelSpecByKernelName
                  : {}
              }
              currentKernel={currentKernelName}
              onChange={this.handleKernelChange}
            />
          ) : null}
        </header>

        {showPanel ? (
          <BinderConsole
            onGitrefChange={this.handleGitrefChange}
            onRepoChange={this.handleRepoChange}
            onFormSubmit={this.handleFormSubmit}
            logs={
              currentServer && currentServer.messages
                ? currentServer.messages
                : []
            }
            repo={repoValue}
            gitref={gitrefValue}
          />
        ) : null}

        <div className="play-editor">
          <CodeMirrorEditor
            // TODO: these should have defaultProps on the codemirror editor
            cellFocused
            editorFocused
            channels={
              currentKernel && currentKernel.channel
                ? currentKernel.channel
                : null
            }
            tip
            completion
            theme="light"
            // TODO: This is the notebook implementation leaking into the editor
            //       component. It shouldn't be here, I won't refactor it as part
            //       of the current play PR though.
            id="not-really-a-cell"
            onFocusChange={noop}
            focusAbove={noop}
            focusBelow={noop}
            // END TODO for notebook leakage
            // TODO: kernelStatus should be allowed to be null or undefined,
            //       resulting in thought of as either idle or not connected by
            //       default. This is primarily used for determining if code
            //       completion should be enabled
            kernelStatus={
              currentKernel ? currentKernel.status : "not connected"
            }
            options={{
              lineNumbers: true,
              extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-Enter": this.handleSourceSubmit,
                "Cmd-Enter": this.handleSourceSubmit
              },
              cursorBlinkRate: 0,
              mode: codeMirrorMode
            }}
            value={sourceValue}
            onChange={this.handleEditorChange}
          />
        </div>

        <div className="play-outputs">
          <Outputs>
            <Display
              outputs={
                currentKernel && currentKernel.outputs
                  ? currentKernel.outputs
                  : []
              }
              expanded
            />
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
            padding: 0px 20px 0px 10px;
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
            font-family: Monaco, monospace;
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
        `}</style>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    repo: state.ui.repo,
    gitref: state.ui.gitref,
    source: state.ui.source,
    platform: state.ui.platform,
    showPanel: state.ui.showPanel,
    currentServerId: state.ui.currentServerId,
    currentKernelName: state.ui.currentKernelName,
    codeMirrorMode: state.ui.codeMirrorMode,
    currentKernel: objectPath.get(state, [
      "entities",
      "serversById",
      state.ui.currentServerId,
      "server",
      "activeKernelsByName",
      state.ui.currentKernelName,
      "kernel"
    ]),
    currentServer: objectPath.get(state, [
      "entities",
      "serversById",
      state.ui.currentServerId,
      "server"
    ])
  };
};

const mapDispatchToProps = {
  activateServer: actions.activateServer,
  submitBinderForm: actions.submitBinderForm,
  setShowPanel: actions.setShowPanel,
  runSource: actions.runSource,
  setActiveKernel: actions.setActiveKernel
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
