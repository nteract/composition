import React from "react";

import { fetchFromGist } from "./fetchers";

import JSONTree from "react-json-tree";
import NotebookPreview from "@nteract/notebook-preview";

const hokeyNB = {
  nbformat: 4,
  nbformat_minor: 0,
  cells: [
    {
      cell_type: "markdown",
      metadata: {},
      source: "Unable to load notebook 😩"
    },
    {
      cell_type: "code",
      metadata: {},
      execution_count: -999,
      source: "print('hey')",
      outputs: []
    }
  ],
  metadata: {}
};

class NotebookPage extends React.Component {
  static async getInitialProps({ query }) {
    // Either the user "provides" it or we give the default gist
    const gistID = query.gistID || "038c4061d5a562d5f24605b93dcffdb6";
    const notebook = await fetchFromGist(gistID);
    if (!notebook) {
      return {
        notebook: hokeyNB
      };
    }
    return {
      notebook
    };
  }

  render() {
    return (
      <div>
        <link rel="stylesheet" href="/static/codemirror.css" />
        <link rel="stylesheet" href="/static/main.css" />
        <link rel="stylesheet" href="/static/theme-light.css" />
        <NotebookPreview notebook={this.props.notebook} />
      </div>
    );
    return;
  }
}

export default NotebookPage;
