/**
 * Main entry point for the desktop notebook UI
 */

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";

import { ContentRecord, ContentRef, createContentRef, makeAppRecord, makeCommsRecord, makeContentsRecord, makeEntitiesRecord, makeLocalHostRecord, makeNotebookContentRecord, makeStateRecord, makeTransformsRecord } from "@nteract/core";

import DataExplorer from "@nteract/data-explorer";
import WidgetDisplay from "@nteract/jupyter-widgets";
import * as MathJax from "@nteract/mathjax";
import { allConfigOptions } from "@nteract/mythic-configuration";
import NotebookApp from "@nteract/notebook-app-component";
import { Media } from "@nteract/outputs";

import "@nteract/styles/app.css";

import "@nteract/styles/global-variables.css";

import "@nteract/styles/themes/base.css";
import "@nteract/styles/themes/default.css";

import GeoJSONTransform from "@nteract/transform-geojson";
import ModelDebug from "@nteract/transform-model-debug";
import PlotlyTransform from "@nteract/transform-plotly";
import VDOMDisplay from "@nteract/transform-vdom";
import { Vega2, Vega3, Vega4, Vega5, VegaLite1, VegaLite2, VegaLite3, VegaLite4 } from "@nteract/transform-vega";

import "codemirror/addon/hint/show-hint.css";
import "codemirror/lib/codemirror.css";

import { ipcRenderer as ipc, remote } from "electron";

import * as Immutable from "immutable";
import { mathJaxPath } from "mathjax-electron";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { initGlobalHandlers } from "./global-events";
import { initMenuHandlers } from "./menu";
import { initNativeHandlers } from "./native-window";
import { makeDesktopNotebookRecord } from "./state";
import configureStore, { DesktopStore } from "./store";

// Load the nteract fonts
import("./fonts");
// Needs to be last
import "@nteract/styles/editor-overrides.css";

const contentRef = createContentRef();

const initialRefs = Immutable.Map<ContentRef, ContentRecord>().set(
  contentRef,
  makeNotebookContentRecord()
);

const store = configureStore({
  app: makeAppRecord({
    host: makeLocalHostRecord(),
    version: remote.app.getVersion()
  }),
  comms: makeCommsRecord(),
  core: makeStateRecord({
    entities: makeEntitiesRecord({
      contents: makeContentsRecord({
        byRef: initialRefs
      }),
      transforms: makeTransformsRecord({
        displayOrder: Immutable.List([
          "application/vnd.jupyter.widget-view+json",
          "application/vnd.vega.v5+json",
          "application/vnd.vega.v4+json",
          "application/vnd.vega.v3+json",
          "application/vnd.vega.v2+json",
          "application/vnd.vegalite.v4+json",
          "application/vnd.vegalite.v3+json",
          "application/vnd.vegalite.v2+json",
          "application/vnd.vegalite.v1+json",
          "application/geo+json",
          "application/vnd.plotly.v1+json",
          "text/vnd.plotly.v1+html",
          "application/x-nteract-model-debug+json",
          "application/vnd.dataresource+json",
          "application/vdom.v1+json",
          "application/json",
          "application/javascript",
          "text/html",
          "text/markdown",
          "text/latex",
          "image/svg+xml",
          "image/gif",
          "image/png",
          "image/jpeg",
          "text/plain"
        ]),
        byId: Immutable.Map({
          "text/vnd.plotly.v1+html": PlotlyTransform,
          "application/vnd.plotly.v1+json": PlotlyTransform,
          "application/geo+json": GeoJSONTransform,
          "application/x-nteract-model-debug+json": ModelDebug,
          "application/vnd.dataresource+json": DataExplorer,
          "application/vnd.jupyter.widget-view+json": WidgetDisplay,
          "application/vnd.vegalite.v1+json": VegaLite1,
          "application/vnd.vegalite.v2+json": VegaLite2,
          "application/vnd.vegalite.v3+json": VegaLite3,
          "application/vnd.vegalite.v4+json": VegaLite4,
          "application/vnd.vega.v2+json": Vega2,
          "application/vnd.vega.v3+json": Vega3,
          "application/vnd.vega.v4+json": Vega4,
          "application/vnd.vega.v5+json": Vega5,
          "application/vdom.v1+json": VDOMDisplay,
          "application/json": Media.Json,
          "application/javascript": Media.JavaScript,
          "text/html": Media.HTML,
          "text/markdown": Media.Markdown,
          "text/latex": Media.LaTeX,
          "image/svg+xml": Media.SVG,
          "image/gif": Media.Image,
          "image/png": Media.Image,
          "image/jpeg": Media.Image,
          "text/plain": Media.Plain
        })
      })
    })
  }),
  desktopNotebook: makeDesktopNotebookRecord()
});

// Register for debugging
declare global {
  interface Window {
    store: DesktopStore;
  }
}
window.store = store;

initNativeHandlers(contentRef, store);
initMenuHandlers(contentRef, store);
initGlobalHandlers(contentRef, store);

export default class App extends React.PureComponent {
  componentDidMount(): void {
    ipc.send("react-ready");
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        <MathJax.Provider src={mathJaxPath} input="tex">
          <NotebookApp
            // The desktop app always keeps the same contentRef in a
            // browser window
            contentRef={contentRef}
          />
        </MathJax.Provider>
      </Provider>
    );
  }
}

ipc.send("transfer-config-options-to-main", allConfigOptions());

const app = document.querySelector("#app");

if (app) {
  ReactDOM.render(<App />, app);
} else {
  console.error("Failed to bootstrap the notebook app");
}
