/* @flow */

import type { Store } from "redux";
import type { AppState } from "./records";

import { forceShutdownKernel } from "./kernel/shutdown";

export function unload(store: Store<AppState, Action>) {
  const state = store.getState();
  const kernel = {
    channels: state.app.channels,
    spawn: state.app.spawn,
    connectionFile: state.app.connectionFile
  };
  forceShutdownKernel(kernel);
}

export function initGlobalHandlers(store: Store<AppState, Action>) {
  global.window.onunload = unload.bind(null, store);
}
