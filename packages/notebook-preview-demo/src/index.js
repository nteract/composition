/* eslint-disable react/prop-types */

import React from "react";
import ReactDOM from "react-dom";

import "normalize.css/normalize.css";
import "codemirror/lib/codemirror.css";

import "@nteract/notebook-preview/styles/main.css";
import "@nteract/notebook-preview/styles/theme-light.css";
import "react-virtualized/styles.css";

import {
  standardTransforms,
  standardDisplayOrder,
  registerTransform
} from "@nteract/transforms";
import DataResourceTransform from "@nteract/transform-dataresource";

import NotebookPreview from "@nteract/notebook-preview";

import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

import "./App.css";
import "./index.css";
import logo from "./logo.svg";

import { fetchFromGist } from "./fetchers";

const commutable = require("@nteract/commutable");

const {
  transforms,
  displayOrder
} = registerTransform(
  {
    transforms: standardTransforms,
    displayOrder: standardDisplayOrder
  },
  DataResourceTransform
);

const gistIDs = [
  "038c4061d5a562d5f24605b93dcffdb6",
  "8ea760c2e2a6bba2ebff27125a548508"
];

const gistID = gistIDs[Math.floor(Math.random() * gistIDs.length)];

// TODO: See if there's a way to load a raw file (like a notebook) using the
//       webpack setup without having to eject create-react-app

class GistedNotebook extends React.Component {
  constructor() {
    super();
    this.state = {
      notebook: null
    };
  }

  componentDidMount() {
    fetchFromGist(this.props.match.params.gistID).then(nbJSON => {
      this.setState({
        notebook: commutable.fromJS(nbJSON)
      });
    });
  }

  render() {
    if (this.state.notebook) {
      return (
        <NotebookPreview
          notebook={this.state.notebook}
          displayOrder={displayOrder}
          transforms={transforms}
        />
      );
    }
    return <h1>Loading Notebook...</h1>;
  }
}

ReactDOM.render(
  <Router>
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </div>
      <Route
        exact
        path="/"
        render={() => <Redirect to={`/gist/${gistID}`} />}
      />
      <Route path="/gist/:gistID" component={GistedNotebook} />
    </div>
  </Router>,
  document.getElementById("root")
);
