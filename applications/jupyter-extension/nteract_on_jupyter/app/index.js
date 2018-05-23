// @flow
// NOTE: We _must_ load hot _before_ React, even though we don't use it in this file
import { hot } from "react-hot-loader";

import * as React from "react";
import ReactDOM from "react-dom";

import App from "./app";

import { Provider } from "react-redux";
import * as Immutable from "immutable";
import configureStore from "./store";
import {
  actions,
  createKernelspecsRef,
  createKernelRef,
  makeDummyContentRecord,
  makeContentsRecord,
  makeEntitiesRecord,
  makeStateRecord,
  makeHostsRecord,
  makeCommsRecord,
  makeAppRecord,
  createContentRef,
  createHostRef,
  makeJupyterHostRecord
} from "@nteract/core";

import type { AppState } from "@nteract/core";

const urljoin = require("url-join");

require("./fonts");

export type JupyterConfigData = {
  token: string,
  page: "tree" | "view" | "edit",
  contentsPath: string,
  baseUrl: string,
  appVersion: string,
  assetUrl: string
};

function main(rootEl: Element, dataEl: Node | null) {
  // When the data element isn't there, provide an error message
  // Primarily for development usage
  const ErrorPage = (props: { error?: Error }) => (
    <React.Fragment>
      <h1>ERROR</h1>
      <pre>Unable to parse / process the jupyter config data.</pre>
      {props.error ? props.error.message : null}
    </React.Fragment>
  );

  if (!dataEl) {
    ReactDOM.render(<ErrorPage />, rootEl);
    return;
  }

  let config: JupyterConfigData;

  try {
    config = JSON.parse(dataEl.textContent);
  } catch (err) {
    ReactDOM.render(<ErrorPage error={err} />, rootEl);
    return;
  }

  // Allow chunks from webpack to load from their built location
  declare var __webpack_public_path__: string;
  __webpack_public_path__ = urljoin(config.assetUrl, "nteract/static/dist/");

  const jupyterHostRecord = makeJupyterHostRecord({
    id: null,
    type: "jupyter",
    defaultKernelName: "python",
    token: config.token,
    origin: location.origin,
    basePath: config.baseUrl
  });

  const hostRef = createHostRef();
  const contentRef = createContentRef();

  const initialState: AppState = {
    app: makeAppRecord({
      version: `nteract-on-jupyter@${config.appVersion}`,
      // TODO: Move into core as a "current" host
      host: jupyterHostRecord
    }),
    comms: makeCommsRecord(),
    config: Immutable.Map({
      theme: "light"
    }),
    core: makeStateRecord({
      entities: makeEntitiesRecord({
        hosts: makeHostsRecord({
          byRef: Immutable.Map().set(hostRef, jupyterHostRecord)
        }),
        contents: makeContentsRecord({
          byRef: Immutable.Map().set(
            contentRef,
            makeDummyContentRecord({
              filepath: config.contentsPath
            })
          )
        })
      })
    })
  };

  const kernelRef = createKernelRef();
  const kernelspecsRef = createKernelspecsRef();

  const store = configureStore(initialState);
  window.store = store;

  store.dispatch(
    actions.fetchContent({
      filepath: config.contentsPath,
      params: {},
      kernelRef,
      contentRef
    })
  );
  store.dispatch(actions.fetchKernelspecs({ hostRef, kernelspecsRef }));

  ReactDOM.render(
    <Provider store={store}>
      <App contentRef={contentRef} />
    </Provider>,
    rootEl
  );
}

const rootEl = document.querySelector("#root");
const dataEl = document.querySelector("#jupyter-config-data");

if (!rootEl || !dataEl) {
  alert("Something drastic happened, and we don't have config data");
} else {
  main(rootEl, dataEl);
}
