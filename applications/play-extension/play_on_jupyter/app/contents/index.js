// @flow

import * as React from "react";
import * as Immutable from "immutable";

import {
  state as stateModule,
  selectors,
  actions,
  TitleBar,
  NotebookMenu
} from "@nteract/core";

// TODO: Make a proper epic
import { contents, sessions } from "rx-jupyter";
const urljoin = require("url-join");
import { first, map, mergeMap } from "rxjs/operators";
import { forkJoin } from "rxjs/observable/forkJoin";

import { dirname } from "path";

import { default as Directory } from "./directory";
import { default as File } from "./file";

type ContentRef = stateModule.ContentRef;

import { connect } from "react-redux";

type ContentsProps = {
  contentType: "dummy" | "notebook" | "directory" | "file",
  contentRef: ContentRef,
  filepath: string,
  appPath: string,
  serverConfig: *,
  appVersion: string,
  baseDir: string
};

const mapStateToProps = (
  state: stateModule.AppState,
  ownProps: *
): ContentsProps => {
  const contentRef = selectors.currentContentRef(state);
  const host = state.app.host;
  if (host.type !== "jupyter") {
    throw new Error("this component only works with jupyter apps");
  }
  const serverConfig = selectors.serverConfig(host);

  if (!contentRef) {
    throw new Error("cant display without a contentRef");
  }

  const content = selectors.content(state, { contentRef });
  if (!content) {
    throw new Error("need content to view content, check your contentRefs");
  }

  const appVersion = selectors.appVersion(state);

  // Our base directory is the literal directory we're in otherwise it's relative
  // to the file being viewed.
  const baseDir =
    content.type === "directory" ? content.filepath : dirname(content.filepath);

  return {
    contentType: content.type,
    contentRef,
    filepath: content.filepath,
    appPath: host.basePath,
    serverConfig,
    appVersion,
    baseDir
  };
};

const Container = ({ children }) => (
  <div>
    {children}
    <style jsx>{`
      div {
        padding-left: var(--nt-spacing-l, 10px);
        padding-top: var(--nt-spacing-m, 10px);
        padding-right: var(--nt-spacing-m, 10px);
      }
    `}</style>
  </div>
);

class Contents extends React.Component<ContentsProps, null> {
  render() {
    switch (this.props.contentType) {
      case "notebook":
        return (
          <React.Fragment>
            <TitleBar
              logoHref={urljoin(
                this.props.appPath,
                "/play/v/",
                this.props.baseDir
              )}
            />

            <h1>We don't support Notebooks in Play</h1>
          </React.Fragment>
        );
      case "file":
        return (
          <React.Fragment>
            <TitleBar
              logoHref={urljoin(
                this.props.appPath,
                "/play/v/",
                this.props.baseDir
              )}
            />
            <Container>
              <File contentRef={this.props.contentRef} />
            </Container>
          </React.Fragment>
        );
      case "dummy":
        return (
          <React.Fragment>
            <TitleBar
              logoHref={urljoin(
                this.props.appPath,
                "/play/v/",
                this.props.baseDir
              )}
            />
          </React.Fragment>
        );
      case "directory":
        return (
          <React.Fragment>
            <TitleBar logoHref={urljoin(this.props.appPath, "/play/v/")} />
            <Directory contentRef={this.props.contentRef} />
          </React.Fragment>
        );
      default:
        return (
          <div>{`content type ${this.props.contentType} not implemented`}</div>
        );
    }
  }
}

export default connect(mapStateToProps)(Contents);
