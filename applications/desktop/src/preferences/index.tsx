/**
 * Main entry point for the desktop preference window
 */

import { DarkTheme, LightTheme } from "@nteract/presentational-components";
import { Kernelspecs } from "@nteract/types";
import { Event, ipcRenderer as ipc } from "electron";
import * as React from "react";
import ReactDOM from "react-dom";
import { connect, Provider } from "react-redux";

import { ALL_CONFIG_OTIONS, ConfigurationState, ConfigurationValue, receiveKernelspecs } from "../common/config";
import { watchConfigFile } from "../common/config/use-cases";
import { Item } from "./items";
import { configurePreferencesStore, PreferencesStore } from "./setup/store";

import "../../../../packages/styles/app.css";
import "../../../../packages/styles/global-variables.css";
import "./preferences.css";

declare global {
  interface Window {
    store: PreferencesStore;
  }
}

window.store = configurePreferencesStore();
window.store.dispatch(watchConfigFile());

ipc.on("kernel_specs_reply", (_event: Event, kernelspecs: Kernelspecs) => {
  window.store.dispatch(receiveKernelspecs(kernelspecs));
});

ipc.send("kernel_specs_request");

interface AppProps {
  theme: ConfigurationValue;
}

const makeMapStateToProps =
  (state: ConfigurationState): AppProps => ({
    theme: state.config.get("theme"),
  });

export const PureApp = ({theme}: AppProps) =>
  <main>
    {theme === "light" ? <LightTheme/> : null}
    {theme === "dark"  ? <DarkTheme/> : null}
    {ALL_CONFIG_OTIONS.map(item => <Item {...item} key={
      "id" in item ? item.id : "heading" in item ? item.heading : undefined
    }/>)}
  </main>;

const App = connect(makeMapStateToProps)(PureApp);

App.displayName = "App";

ReactDOM.render(
  <Provider store={window.store}>
    <App/>
  </Provider>,
  document.querySelector("#app"),
);
