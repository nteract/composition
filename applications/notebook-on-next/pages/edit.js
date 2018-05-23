// FIXME: To make it easier to iterate on supported apps, flow is disabled for
// this file
import * as React from "react";
import fetch from "isomorphic-fetch";
import { monocellNotebook, fromJS, toJS } from "@nteract/commutable";

import NotebookApp from "@nteract/notebook-app-component";
import { Styles } from "@nteract/presentational-components";

import { Provider } from "react-redux";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import configureStore from "../store";

const store = configureStore();

async function fetchFromGist(gistId): ?Object {
  const path = `https://api.github.com/gists/${gistId}`;

  return fetch(path)
    .then(async response => {
      if (response.status !== 200) return null;
      const ghResponse = await response.json();
      for (const file in ghResponse.files) {
        if (/.ipynb$/.test(file)) {
          const fileResponse = ghResponse.files[file];
          if (fileResponse.truncated) {
            return fetch(fileResponse.raw_url).then(resp => resp.json());
          }
          return JSON.parse(fileResponse.content);
        }
      }
    })
    .catch(err => toJS(monocellNotebook));
}

const Error = () => (
  <React.Fragment>
    <style jsx>{`
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 30px;
      font-family: Source Sans Pro, Helvetica, sans-serif;
    `}</style>
    Could not fetch notebook.
  </React.Fragment>
);

export default class Edit extends React.Component<*> {
  static async getInitialProps(context: Object) {
    const query = context.query;
    const isServer = context.isServer;

    let serverNotebook;
    if (query.gistid) {
      serverNotebook = await fetchFromGist(query.gistid);
    }

    if (!serverNotebook) {
      serverNotebook = toJS(monocellNotebook);
    }

    throw new Error(
      "Notebook on next has not been migrated to the new state tree"
    );

    // TODO: provide notebook using fetchContentFulfilled
    store.dispatch(actions.fetchContentFulfilled({}));
    return { serverNotebook, isServer };
  }

  componentWillMount() {
    if (this.props.serverNotebook) {
      throw new Error(
        "Notebook on next has not been migrated to the new state tree"
      );

      // TODO: provide notebook using fetchContentFulfilled
      store.dispatch(actions.fetchContentFulfilled());
    }
  }

  render() {
    if (!this.props.serverNotebook) return <Error />;
    return (
      <React.Fragment>
        <style
          dangerouslySetInnerHTML={{
            __html: `@media print {
          * {
            box-shadow: none !important;
          }
          .status-bar {
            display: none !important;
          }
          .notifications-wrapper {
            display: none !important;
          }
          .cell-toolbar {
            display: none !important;
          }
          .cell-creator {
            display: none !important;
          }
          .cell.focused {
            border: none;
            background: var(--theme-cell-bg, white) !important;
          }
          .cell:focus .prompt,
          .cell.focused .prompt {
            background: var(--theme-pager-bg, #fafafa) !important;
          }
          .draggable-cell {
            padding: 0px !important;
          }
          .cell-drag-handle {
            display: none !important;
          }
          .cell-toolbar-mask {
            display: none !important;
          }
          .invisible {
            display: none !important;
          }
        }
        @media not print {
          .cells {
            padding-bottom: calc(100vh - 110px);
          }
        }
        body {
          margin: 0;
          font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont,
            "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji",
            "Segoe UI Emoji", "Segoe UI Symbol";
          font-size: 1em;
        }`
          }}
        />
        <Provider store={store}>
          <div>
            <Styles>
              <NotebookApp />;
            </Styles>
          </div>
        </Provider>
      </React.Fragment>
    );
  }
}
