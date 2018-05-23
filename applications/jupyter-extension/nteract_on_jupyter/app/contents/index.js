// @flow

// NOTE: We can safely install and use react-hot-loader as a regular dependency
// instead of a dev dependency as it automatically ensures it is not executed
// in production and the footprint is minimal.
import { hot } from "react-hot-loader";

import * as React from "react";

import { selectors } from "@nteract/core";

import type {
  KernelspecRecord,
  KernelspecProps,
  AppState,
  JupyterHostRecord,
  ContentRef
} from "@nteract/core";

import css from "styled-jsx/css";

const urljoin = require("url-join");

import { default as Directory } from "./directory";
import { default as File } from "./file";
import { default as Notebook } from "./notebook";

import { ThemedLogo } from "../components/themed-logo";

import { WideLogo } from "@nteract/logos";

import { Nav, NavSection } from "../components/nav";

import { connect } from "react-redux";

type ContentsProps = {
  contentType: "dummy" | "notebook" | "directory" | "file",
  contentRef: ContentRef,
  appBase: string
};

const mapStateToProps = (
  state: AppState,
  ownProps: { contentRef: ContentRef }
): ContentsProps => {
  const contentRef = ownProps.contentRef;
  const host = state.app.host;
  if (host.type !== "jupyter") {
    throw new Error("this component only works with jupyter apps");
  }

  if (!contentRef) {
    throw new Error("cant display without a contentRef");
  }

  const content = selectors.content(state, { contentRef });
  if (!content) {
    throw new Error("need content to view content, check your contentRefs");
  }

  return {
    contentType: content.type,
    contentRef,
    appBase: urljoin(host.basePath, "/nteract/edit")
  };
};

class Contents extends React.Component<ContentsProps, null> {
  render() {
    const appBase = this.props.appBase;

    switch (this.props.contentType) {
      case "notebook":
      case "file":
      case "dummy":
        return <File contentRef={this.props.contentRef} appBase={appBase} />;
      case "directory":
        return (
          <Directory contentRef={this.props.contentRef} appBase={appBase} />
        );
      default:
        return (
          <React.Fragment>
            <Nav>
              <NavSection>
                <a href={urljoin(this.props.appBase)} title="Home">
                  <ThemedLogo />
                </a>
              </NavSection>
            </Nav>
            <div>{`content type ${
              this.props.contentType
            } not implemented`}</div>
          </React.Fragment>
        );
    }
  }
}

export default connect(mapStateToProps)(hot(module)(Contents));
