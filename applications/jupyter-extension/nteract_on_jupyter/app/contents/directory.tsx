import { NewNotebookNavigation } from "@nteract/connected-components";
import {
  AppState,
  ContentRef,
  DirectoryContentRecord,
  JupyterHostRecord,
  KernelspecProps,
  KernelspecRecord,
  selectors
} from "@nteract/core";
import {
  Entry,
  Icon,
  LastSaved,
  Listing,
  Name
} from "@nteract/directory-listing";
import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import urljoin from "url-join";

import { openNotebook } from "../triggers/open-notebook";

const ListingRoot = styled.div`
  margin-top: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
`;

interface LightDirectoryEntry {
  last_modified: Date | null;
  name: string;
  path: string;
  type: "notebook" | "dummy" | "directory" | "file" | "unknown";
}

type LightDirectoryEntries = LightDirectoryEntry[];

interface DirectoryProps {
  appBase: string;
  content: DirectoryContentRecord;
  host: JupyterHostRecord;
  appVersion: string;
  contentRef: ContentRef;
  contents: LightDirectoryEntries;
}

export class DirectoryApp extends React.PureComponent<DirectoryProps> {
  openNotebook = (ks: KernelspecRecord | KernelspecProps) => {
    openNotebook(this.props.host, ks, {
      appBase: this.props.appBase,
      appVersion: this.props.appVersion,
      // Since we're looking at a directory, the base dir is the directory we are in
      baseDir: this.props.content.filepath
    });
  };

  render() {
    const atRoot = this.props.content.filepath === "/";
    const dotdothref = urljoin(
      this.props.appBase,
      // Make sure leading / and .. don't navigate outside of the appBase
      urljoin(this.props.content.filepath, "..")
    );
    const dotdotlink = (
      <a href={dotdothref} title="Navigate down a directory" role="button">
        {".."}
      </a>
    );

    return (
      <React.Fragment>
        {/* <NewNotebookNavigation onClick={this.openNotebook} /> */}
        <ListingRoot>
          <Listing>
            {this.props.contents.map((entry, index) => {
              const link = (
                <a
                  href={urljoin(this.props.appBase, entry.path)}
                  // When it's a notebook, we open a new tab
                  target={entry.type === "notebook" ? "_blank" : undefined}
                >
                  {entry.name}
                </a>
              );

              return (
                <Entry key={index}>
                  <Icon fileType={entry.type} />
                  <Name>{link}</Name>
                  <LastSaved lastModified={entry.last_modified} />
                </Entry>
              );
            })}
          </Listing>
        </ListingRoot>
      </React.Fragment>
    );
  }
}

interface InitialProps {
  contentRef: ContentRef;
  appBase: string;
}

const makeMapStateToDirectoryProps = (
  initialState: AppState,
  initialProps: InitialProps
): ((state: AppState) => DirectoryProps) => {
  const { contentRef, appBase } = initialProps;
  const mapStateToDirectoryProps = (state: AppState) => {
    const content = selectors.content(state, initialProps);
    const contents: LightDirectoryEntry[] = [];
    const host = selectors.currentHost(state);

    if (host.type !== "jupyter") {
      throw new Error("This component only works with jupyter servers");
    }

    if (!content || content.type !== "directory") {
      throw new Error(
        "The directory component should only be used with directory contents"
      );
    }

    content.model.items.map((entryRef: ContentRef) => {
      const row = selectors.content(state, { contentRef: entryRef });
      if (!row) {
        return {
          last_modified: new Date(),
          name: "",
          path: "",
          type: ""
        };
      }

      if (row.type !== "dummy") {
        return null;
      }

      contents.push({
        last_modified: row.lastSaved,
        name: row.filepath,
        path: row.filepath,
        type: row.assumedType
      });
    });

    return {
      appBase,
      appVersion: selectors.appVersion(state),
      content,
      contentRef,
      contents,
      host
    };
  };
  return mapStateToDirectoryProps;
};

export const ConnectedDirectory = connect(makeMapStateToDirectoryProps)(
  DirectoryApp
);

export default ConnectedDirectory;
