/* @flow strict */
import { createStore, applyMiddleware, compose } from "redux";
import { electronEnhancer } from "redux-electron-store";

import reducers from "./reducers.js";
import logger from "../notebook/logger.js";

const middlewares = [];

/* istanbul ignore if -- only used for debugging */
if (process.env.DEBUG === "true") {
  middlewares.push(logger());
}

export default function configureStore() {
  return createStore(
    reducers,
    compose(
      applyMiddleware(...middlewares),
      electronEnhancer()
    )
  );
}
