/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import type { AppState } from "@nteract/core";

import { List as ImmutableList, Map as ImmutableMap } from "immutable";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

import { reducers, epics as coreEpics } from "@nteract/core";

import { routerReducer, routerMiddleware } from "react-router-redux";

const rootReducer = combineReducers({
  router: routerReducer,
  app: reducers.app,
  comms: reducers.comms,
  config: reducers.config,
  core: reducers.core
});

export default function configureStore(initialState: AppState, history: *) {
  const rootEpic = combineEpics(...coreEpics.allEpics);
  const middlewares = [
    createEpicMiddleware(rootEpic),
    // Build the middleware for intercepting and dispatching navigation actions
    routerMiddleware(history)
  ];

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
