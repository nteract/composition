// @flow
import * as React from "react";
import * as Immutable from "immutable";

import NotebookPreview from "@nteract/notebook-preview";
import { emptyNotebook, fromJS } from "@nteract/commutable";

import { light, dark } from "@nteract/core/themes";

import { ajax } from "rxjs/observable/dom/ajax";

function frozenReviver(key, value) {
  return Object.freeze(value);
}

function createFrozenNotebook(text) {
  return JSON.parse(text, frozenReviver);
}

function fetchFromGist(gistId = "038c4061d5a562d5f24605b93dcffdb6") {
  const path = `https://api.github.com/gists/${gistId}`;
  return (
    ajax
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
      // .then(nb => fromJS(nb))
      .catch(err => emptyNotebook)
  );
}

class StaticNotebookApp extends React.Component<
  { gistID: string },
  { notebook: any, theme: "light" | "dark" }
> {
  constructor(props: { gistID: string }) {
    super(props);
    this.state = {
      notebook: emptyNotebook,
      theme: "light"
    };
  }

  toggleTheme() {
    this.setState({ theme: this.state.theme === "light" ? "dark" : "light" });
  }

  static defaultProps = {
    gistID: "038c4061d5a562d5f24605b93dcffdb6"
  };

  static async getInitialProps(context: Object) {
    const query: Object = context.query;
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
      return (
        <div>
          <button onClick={() => this.toggleTheme()} className="theme-toggle">
            Toggle Theme
          </button>
          <NotebookPreview
            notebook={this.state.notebook}
            theme={this.state.theme}
          />
          <style jsx>{`
            /* Dark Button CSS */
            .theme-toggle {
              position: absolute;
              z-index: 1000;
              right: 20px;

              /* prettier-ignore */
              font-family:  "Source Sans Pro", Helvetica Neue, Helvetica, Arial, sans-serif;
              outline: 0;
              padding: 5px 12px;
              display: block;
              color: #9fa8b0;
              font-weight: bold;
              text-shadow: 1px 1px #1f272b;
              border: 1px solid #1c252b;
              border-radius: 3px;
              -moz-border-radius: 3px;
              -webkit-border-radius: 3px;
              background: #232b30; /* old browsers */
              box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2); /* CSS3 */
            }
            .theme-toggle:hover {
              color: #fff;
              background: #4c5a64; /* old browsers */
            }
            .theme-toggle:active {
              color: #fff;
              padding: 6px 12px 4px;
              background: #20282d; /* old browsers */
              box-shadow: 1px 1px 1px rgba(255, 255, 255, 0.1); /* CSS3 */
            }
          `}</style>
          <style jsx global>{`
            body {
              background-color: ${this.state.theme === "light"
                ? "white"
                : "black"};
            }

            .theme-toggle {
              background-color: "black";
            }
          `}</style>
        </div>
      );
    }
    return <div>loading...</div>;
  }
}

export default StaticNotebookApp;
