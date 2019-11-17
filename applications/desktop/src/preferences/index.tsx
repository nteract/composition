/**
 * Main entry point for the desktop preference window
 */

import { DarkTheme, LightTheme } from "@nteract/presentational-components";
import * as React from "react";
import ReactDOM from "react-dom";
import { connect, Provider } from "react-redux";

import { actions } from "../common/use-cases";
import { Item } from "./items";

import * as schema from "./schema";
import { PreferencesAppState } from "./setup/state";
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
window.store.dispatch(actions.watchConfigFile());

interface AppProps {
  theme: string;
}

const makeMapStateToProps =
  (state: PreferencesAppState): AppProps => ({
    theme: state.config.get("theme"),
  });

export const PureApp = ({theme}: AppProps) =>
  <main>
    {theme === "light" ? <LightTheme/> : null}
    {theme === "dark"  ? <DarkTheme/> : null}
    {schema.ALL_PREFERENCES.map(item => <Item {...item} key={
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
