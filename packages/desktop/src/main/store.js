/* @flow */
import { createStore, applyMiddleware, compose } from "redux";
import { electronEnhancer } from "redux-electron-store";

import reducers from "./reducers";

const middlewares = [];

/* istanbul ignore if -- only used for debugging */
if (process.env.DEBUG === "true") {
  const logger = require("../notebook/logger"); // eslint-disable-line global-require

  middlewares.push(logger());
}

export default function configureStore() {
  return createStore(
    reducers,
    compose(applyMiddleware(...middlewares), electronEnhancer())
  );
}
