// @flow
import React from "react";
import { ConnectedNotebook } from "@nteract/core/lib/components/notebook";
import fetch from "isomorphic-fetch";
import configureStore from "../store";
import withRedux from "next-redux-wrapper";
import { emptyNotebook, fromJS } from "@nteract/commutable";
import { Map } from "immutable";
import type { List } from "immutable";

const store = () => configureStore({});

async function fetchFromGist(gistId) {
  const path = `https://api.github.com/gists/${gistId}`;
  return fetch(path)
    .then(async response => {
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
    .catch(err => emptyNotebook);
}

type Props = {
  cellOrder: List<any>,
  cellMap: Map<string, any>,
  language: string
};

class Edit extends React.Component<Props, Props> {
  static async getInitialProps({ query, res }) {
    const notebook = await fetchFromGist(query.gistid);
    return { notebook };
  }

  constructor(props) {
    super(props);
    const notebook = fromJS(props.notebook);
    const language = notebook.getIn(
      ["metadata", "language_info", "codemirror_mode", "name"],
      notebook.getIn(
        ["metadata", "language_info", "codemirror_mode"],
        notebook.getIn(["metadata", "language_info", "name"], "text")
      )
    );
    const cellOrder = notebook.get("cellOrder");
    const cellMap = notebook.get("cellMap");
    this.state = { cellOrder, language, cellMap };
  }

  render() {
    const { cellOrder, cellMap, language } = this.state;
    return (
      <ConnectedNotebook
        cellOrder={cellOrder}
        cellMap={cellMap}
        cellPagers={Map()}
        stickyCells={Map()}
        transient={Map()}
        cellFocused={null}
        editorFocused={null}
        theme={"light"}
        lastSaved={new Date()}
        kernelSpecDisplayName={"python"}
        executionState={"idle"}
        models={Map()}
        language={language}
      />
    );
  }
}

export default withRedux(store, null)(Edit);
