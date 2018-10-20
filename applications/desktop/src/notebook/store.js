/* @flow strict */
import { createStore, applyMiddleware, combineReducers } from "redux";

import middlewares from "./middlewares";

import { reducers } from "@nteract/core";
import type { DesktopNotebookAppState } from "./state.js";
import { handleDesktopNotebook } from "./reducers.js";

const rootReducer = combineReducers({
  app: reducers.app,
  comms: reducers.comms,
  config: reducers.config,
  core: reducers.core,
  desktopNotebook: handleDesktopNotebook
});

export default function configureStore(initialState: DesktopNotebookAppState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
