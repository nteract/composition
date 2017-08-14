// @flow

import React from "react";
import ReactDOM from "react-dom";

// TODO: Could do dynamic importing, we'll be lazy for now to start prototyping
import ViewPage from "./pages/view";

import "codemirror/lib/codemirror.css";
import "@nteract/notebook-preview/styles/main.css";
import "@nteract/notebook-preview/styles/theme-light.css";

function main(rootEl: Node | null, dataEl: Node | null) {
  // TODO: Clean this error handling up -- this is mostly here for rapid feedback
  //       while working on nbextension
  const ErrorPage = (props: { error?: Error }) =>
    <div>
      <h1>ERROR</h1>
      <pre>Unable to parse / process the jupyter config data.</pre>
      {props.error ? props.error.message : null}
    </div>;

  if (!dataEl) {
    ReactDOM.render(<ErrorPage />, rootEl);
    return;
  }

  type JupyterConfigData = {
    token: string,
    page: "tree" | "view" | "edit",
    contentsPath: string,
    baseUrl: string,
    appVersion: string
  };

  let jupyterConfigData: JupyterConfigData;

  try {
    jupyterConfigData = JSON.parse(dataEl.textContent);
  } catch (err) {
    ReactDOM.render(<ErrorPage error={err} />, rootEl);
    return;
  }

  const url =
    jupyterConfigData.baseUrl + "api/contents" + jupyterConfigData.contentsPath;

  fetch(url, { credentials: "include" })
    .then(y => {
      console.log(y);
      return y;
    })
    .then(x => x.json())
    .then(contents => {
      ReactDOM.render(
        <div>
          <ViewPage contents={contents} />
        </div>,
        rootEl
      );
    });

  ReactDOM.render(
    <div>
      <pre>Rendering</pre>
      <pre>
        {JSON.stringify(jupyterConfigData, null, 2)}
      </pre>
    </div>,
    rootEl
  );
}

const rootEl = document.querySelector("#root");
const dataEl = document.querySelector("#jupyter-config-data");

main(rootEl, dataEl);
