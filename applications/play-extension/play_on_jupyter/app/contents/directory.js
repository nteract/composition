// @flow

import * as React from "react";
import * as Immutable from "immutable";
const urljoin = require("url-join");

import TimeAgo from "@nteract/timeago";
import { Book, FileText, FileDirectory } from "@nteract/octicons";

import { selectors, actions, state as stateModule } from "@nteract/core";

// Workaround flow limitation for getting these types
type ContentRef = stateModule.ContentRef;
type ContentRecord = stateModule.ContentRecord;
type DirectoryContentRecord = stateModule.DirectoryContentRecord;

import { connect } from "react-redux";

type DirectoryEntryProps = {
  type: "unknown" | "notebook" | "directory" | "file" | "dummy",
  href: string,
  displayName: string
};

/**
 * Note: the URLs we create for clicking have to take into account:
 *    Server base URL   e.g. https://j.nteract.io/user/kylek/
 *    App base URL      e.g. /nteract/edit/
 *    Filepath          e.g. Untitled.ipynb
 */

class DirectoryEntry extends React.PureComponent<DirectoryEntryProps, *> {
  render() {
    const { href, type, displayName } = this.props;

    let Icon = FileText;

    switch (type) {
      case "notebook":
        Icon = Book;
        break;
      case "directory":
        Icon = FileDirectory;
        break;
      case "file":
        Icon = FileText;
        break;
    }

    return (
      <React.Fragment>
        <a
          href={href}
          // When it's a notebook, we open a new tab
          target={type === "notebook" ? "_blank" : undefined}
        >
          <span>
            <Icon width={18} height={18} />
          </span>
          <span>{displayName}</span>
        </a>
        <style jsx>{`
          a {
            display: flex;
            flex-direction: row;
            box-sizing: border-box;
            width: 100%;
            height: 40px;
            justify-content: flex-start;
            align-items: stretch;
            text-decoration: none;
            color: var(--theme-app-fg);
            background-color: var(--theme-app-bg);
          }
          a:hover,
          a:focus {
            background-color: var(--theme-primary-bg-hover);
          }
          a > span:first-child {
            width: 40px;
            padding: 0 10px 0 10px;
            color: var(--theme-primary-fg);
            display: flex;
            justify-content: center;
            align-items: center;
          }
          a > span:last-child {
            flex: 1;
            margin-left: 20px;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

const mapStateToEntryProps = (
  state: stateModule.AppState,
  ownProps: { contentRef: ContentRef }
): DirectoryEntryProps => {
  const host = selectors.currentHost(state);
  if (host.type !== "jupyter") {
    throw new Error("This component only works with jupyter servers");
  }

  const entry = selectors.contentByRef(state).get(ownProps.contentRef);

  if (!entry) {
    // TODO: Determine what we do if we try to load content that isn't in the byRef structure
    return {
      type: "unknown",
      href: "",
      displayName: "Unknown Content"
    };
  }

  const basePath = host.basePath;

  const displayName = entry.filepath.split("/").pop() || "";
  const href = urljoin(basePath, "/nteract/edit/", entry.filepath);

  let type = entry.type;
  if (entry.type === "dummy") {
    type = entry.assumedType;
  }

  return {
    type,
    href,
    displayName
  };
};

const ConnectedEntry = connect(mapStateToEntryProps)(DirectoryEntry);

type DirectoryProps = {
  content: DirectoryContentRecord,
  basePath: string
};

export class Directory extends React.PureComponent<DirectoryProps, *> {
  render() {
    const atRoot = this.props.content.filepath === "/";

    const dotdothref = urljoin(
      this.props.basePath,
      "/nteract/edit/",
      urljoin(this.props.content.filepath, "..")
    );

    return (
      <ul>
        {atRoot ? null : (
          // TODO: Create a contentRef for `..`, even though it's a placeholder
          // When we're not at the root of the tree, show `..`
          <li>
            <DirectoryEntry
              href={dotdothref}
              displayName=".."
              type="directory"
            />
          </li>
        )}
        {this.props.content.model.items.map(contentRef => (
          <li key={contentRef}>
            <ConnectedEntry contentRef={contentRef} />
          </li>
        ))}
        <style jsx>{`
          ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
          }
        `}</style>
      </ul>
    );
  }
}

const mapStateToDirectoryProps = (
  state: stateModule.AppState,
  ownProps: { contentRef: ContentRef }
): DirectoryProps => {
  const host = selectors.currentHost(state);
  const content = selectors.content(state, ownProps);

  if (host.type !== "jupyter") {
    throw new Error("This component only works with jupyter servers");
  }

  if (!content || content.type !== "directory") {
    throw new Error(
      "The directory component should only be used with file contents"
    );
  }

  const basePath = host.basePath;

  return {
    content,
    basePath
  };
};

export const ConnectedDirectory = connect(mapStateToDirectoryProps)(Directory);

export default ConnectedDirectory;
