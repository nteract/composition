// @flow

import React from "react";
import ReactDOM from "react-dom";

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
}

const rootEl = document.querySelector("#root");
const dataEl = document.querySelector("#jupyter-config-data");

main(rootEl, dataEl);
