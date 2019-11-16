/**
 * Main entry point for the desktop preference window
 */

import { actions } from "@nteract/core";
import * as React from "react";
import ReactDOM from "react-dom";
import { Item } from "./items";

import * as schema from "./schema";
import { configurePreferencesStore, PreferencesStore } from "./setup/store";

import "./preferences.css";

declare global {
  interface Window {
    store: PreferencesStore;
  }
}

window.store = configurePreferencesStore();
window.store.dispatch(actions.loadConfig());

export const App = () =>
  <main>
    {schema.ALL_PREFERENCES.map(item => <Item {...item} key={
      "id" in item ? item.id : "heading" in item ? item.heading : undefined
    }/>)}
  </main>;

ReactDOM.render(<App/>, document.querySelector("#app"));
