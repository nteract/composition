// @flow

import * as React from "react";
import * as Immutable from "immutable";

import { selectors, actions } from "@nteract/core";
import type { ContentRef, FileContentRecord, AppState } from "@nteract/core";

import moment from "moment";

import { ThemedLogo } from "../../components/themed-logo";
import { Nav, NavSection } from "../../components/nav";

import LastSaved from "../../components/last-saved.js";

import { dirname } from "path";

import * as TextFile from "./text-file.js";
import { default as Notebook } from "../notebook";

import { connect } from "react-redux";

const urljoin = require("url-join");

const PaddedContainer = ({ children }) => (
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

type FileProps = {
  type: "notebook" | "file" | "dummy",
  contentRef: ContentRef,
  baseDir: string,
  appBase: string,
  displayName: string,
  mimetype: ?string,
  lastSavedStatement: string
};

export class File extends React.PureComponent<FileProps, *> {
  render() {
    // Determine the file handler
    let choice = null;

    // notebooks don't report a mimetype so we'll use the content.type
    if (this.props.type === "notebook") {
      choice = <Notebook contentRef={this.props.contentRef} />;
    } else if (this.props.type === "dummy") {
      choice = null;
    } else if (!this.props.mimetype || !TextFile.handles(this.props.mimetype)) {
      // TODO: Redirect to /files/ endpoint for them to download the file or view
      //       as is
      choice = (
        <PaddedContainer>
          <pre>Can not render this file type</pre>
        </PaddedContainer>
      );
    } else {
      choice = <TextFile.default contentRef={this.props.contentRef} />;
    }

    // Right now we only handle one kind of editor
    // If/when we support more modes, we would case them off here
    return (
      <React.Fragment>
        <Nav>
          <NavSection>
            <a
              href={urljoin(this.props.appBase, this.props.baseDir)}
              title="Home"
            >
              <ThemedLogo />
            </a>
            <span>{this.props.displayName}</span>
          </NavSection>
          <NavSection>
            <LastSaved contentRef={this.props.contentRef} />
          </NavSection>
        </Nav>
        {choice}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (
  state: Object,
  ownProps: { contentRef: ContentRef, appBase: string }
): FileProps => {
  const content = selectors.content(state, ownProps);

  if (!content || content.type === "directory") {
    throw new Error(
      "The file component should only be used with files and notebooks"
    );
  }

  return {
    type: content.type,
    mimetype: content.mimetype,
    contentRef: ownProps.contentRef,
    lastSavedStatement: "recently",
    appBase: ownProps.appBase,
    baseDir: dirname(content.filepath),
    displayName: content.filepath.split("/").pop()
  };
};

export const ConnectedFile = connect(mapStateToProps)(File);

export default ConnectedFile;
