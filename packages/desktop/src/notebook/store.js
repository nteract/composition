/* @flow */
import { createStore, applyMiddleware } from "redux";

import type { AppState } from "./records";

import middlewares from "./middlewares";
import rootReducer from "./reducers";

/* istanbul ignore if -- only used for debugging */
if (process.env.DEBUG === "true") {
  const logger = require("./logger"); // eslint-disable-line global-require

  middlewares.push(logger());
}

export default function configureStore(initialState: AppState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
