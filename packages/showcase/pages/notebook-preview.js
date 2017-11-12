// @flow
import * as React from "react";
import * as Immutable from "immutable";
import NotebookPreview from "@nteract/notebook-preview";
import { emptyNotebook, fromJS } from "@nteract/commutable";

import { ajax } from "rxjs/observable/dom/ajax";

function frozenReviver(key, value) {
  return Object.freeze(value);
}

function createFrozenNotebook(text) {
  return JSON.parse(text, frozenReviver);
}

function fetchFromGist(gistId = "038c4061d5a562d5f24605b93dcffdb6") {
  const path = `https://api.github.com/gists/${gistId}`;
  return ajax
    .getJSON(path)
    .toPromise()
    .then(ghResponse => {
      for (const file in ghResponse.files) {
        if (/.ipynb$/.test(file)) {
          const fileResponse = ghResponse.files[file];
          if (fileResponse.truncated) {
            return fetch(fileResponse.raw_url)
              .then(resp => resp.text())
              .then(createFrozenNotebook);
          }
          return createFrozenNotebook(fileResponse.content);
        }
      }
    })
    .then(nb => fromJS(nb))
    .catch(err => emptyNotebook);
}

class StaticNotebookApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notebook: emptyNotebook
    };
  }

  static defaultProps = {
    gistID: "038c4061d5a562d5f24605b93dcffdb6"
  };

  static async getInitialProps({ query }) {
    // Either the user "provides" it or we give the default gist
    return {
      gistID: query.gistID
    };
  }

  componentDidMount() {
    return fetchFromGist(this.props.gistID).then(notebook => {
      this.setState({ notebook });
    });
  }

  render() {
    if (this.state.notebook) {
      return <NotebookPreview notebook={this.state.notebook} />;
    }
    return <div>loading...</div>;
  }
}

export default StaticNotebookApp;
