// @flow

import React from "react";
import ReactDOM from "react-dom";

const rootEl = document.querySelector("#root");
const jupyterConfigEl = document.querySelector("#jupyter-config-data");

const ErrorPage = () =>
  <div>
    <h1>ERROR</h1>
    <pre>Unable to parse / process the jupyter config data.</pre>
  </div>;

if (!jupyterConfigEl || !jupyterConfigEl.innerText) {
  ReactDOM.render(<ErrorPage />, rootEl);
}

type JupyterConfigData = {};

const jupyterConfigData: JupyterConfigData = JSON.parse(
  jupyterConfigEl.innerText
);

ReactDOM.render(
  <div>
    <pre>Woo</pre>
    <pre>
      {JSON.stringify(jupyterConfigData, null, 2)}
    </pre>
    <p />
  </div>,
  rootEl
);

/**
 *
 * Ok, I have to admit that I won't be able to do next.js
 *
 * As much as possible I'm going to emulate the style, which likely means
 * that I'll be setting up pages and components as separate pieces.
 *
 */

/**
  * Pages to create:
  *
  * /notebooks/
  * /edit/
  *
  */
