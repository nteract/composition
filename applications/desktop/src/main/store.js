/* @flow strict */
import { createStore, applyMiddleware, compose } from "redux";
import { electronEnhancer } from "redux-electron-store";
import { middlewares as coreMiddlewares } from "@nteract/core";

import reducers from "./reducers.js";

const middlewares = [];

/* istanbul ignore if -- only used for debugging */
if (process.env.DEBUG === "true") {
  middlewares.push(coreMiddlewares.logger());
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
