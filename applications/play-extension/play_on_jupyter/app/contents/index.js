// @flow

import * as React from "react";
import * as Immutable from "immutable";

import {
  state as stateModule,
  selectors,
  actions,
  TitleBar,
  NotebookApp,
  NotebookMenu,
  NewNotebookNavigation
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
  constructor(props) {
    super(props);
    (this: any).openNotebook = this.openNotebook.bind(this);
  }

  openNotebook(ks: stateModule.KernelspecRecord | stateModule.KernelspecProps) {
    const serverConfig = this.props.serverConfig;

    // The notebook they get to start with
    const notebook = {
      cells: [
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: []
        }
      ],
      metadata: {
        kernelspec: {
          display_name: ks.displayName,
          language: ks.language,
          name: ks.name
        },
        nteract: {
          version: this.props.appVersion
        }
      },
      nbformat: 4,
      nbformat_minor: 2
    };

    // NOTE: For the sake of expediency, all the logic to launch a new is
    //       happening here instead of an epic
    contents
      // Create UntitledXYZ.ipynb by letting the server do it
      .create(this.props.serverConfig, this.props.baseDir, {
        type: "notebook"
        // NOTE: The contents API appears to ignore the content field for new
        // notebook creation.
        //
        // It would be nice if it could take it. Instead we'll create a new
        // notebook for the user and redirect them after we've put in the
        // content we want.
        //
        // Amusingly, this could be used for more general templates to, as
        // well as introduction notebooks.
      })
      .pipe(
        // We only expect one response, it's ajax and we want this subscription
        // to finish so we don't have to unsubscribe
        first(),
        mergeMap(({ response, status }) => {
          const filepath = response.path;

          const sessionPayload = {
            kernel: {
              id: null,
              name: ks.name
            },
            name: "",
            path: filepath,
            type: "notebook"
          };

          return forkJoin(
            // Get their kernel started up
            sessions.create(this.props.serverConfig, sessionPayload),
            // Save the initial notebook document
            contents.save(this.props.serverConfig, filepath, {
              type: "notebook",
              content: notebook
            })
          );
        }),
        first(),
        map(([session, content]) => {
          const { response, status } = content;

          const url = urljoin(
            // User path
            this.props.appPath,
            // nteract edit path
            "/nteract/edit",
            // Actual file
            response.path
          );

          // Always open new notebooks in new windows
          window.open(url, "_blank");
        })
      )
      .subscribe();
  }

  render() {
    switch (this.props.contentType) {
      case "notebook":
        return (
          <React.Fragment>
            <TitleBar
              logoHref={urljoin(
                this.props.appPath,
                "/nteract/edit/",
                this.props.baseDir
              )}
            />
            <NotebookMenu />
            <NotebookApp contentRef={this.props.contentRef} />
          </React.Fragment>
        );
      case "file":
        return (
          <React.Fragment>
            <TitleBar
              logoHref={urljoin(
                this.props.appPath,
                "/nteract/edit/",
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
                "/nteract/edit/",
                this.props.baseDir
              )}
            />
          </React.Fragment>
        );
      case "directory":
        return (
          <React.Fragment>
            <TitleBar
              logoHref={urljoin(this.props.appPath, "/nteract/edit/")}
            />
            <NewNotebookNavigation onClick={this.openNotebook} />
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
