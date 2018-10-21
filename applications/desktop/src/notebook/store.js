/* @flow strict */
import { createStore, applyMiddleware, combineReducers } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";
import { middlewares as coreMiddlewares, reducers } from "@nteract/core";

import type { DesktopNotebookAppState } from "./state";
import { handleDesktopNotebook } from "./reducers";
import logger from "./logger";
import epics from "./epics";

const rootEpic = combineEpics(...epics);
const epicMiddleware = createEpicMiddleware();
const middlewares = [epicMiddleware, coreMiddlewares.errorMiddleware];

if (process.env.DEBUG === "true") {
  middlewares.push(logger());
}

const rootReducer = combineReducers({
  app: reducers.app,
  comms: reducers.comms,
  config: reducers.config,
  core: reducers.core,
  desktopNotebook: handleDesktopNotebook
});

export default function configureStore(initialState: DesktopNotebookAppState) {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
  epicMiddleware.run(rootEpic);
  return store;
}
