/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import type { AppState } from "@nteract/core";

import { List as ImmutableList, Map as ImmutableMap } from "immutable";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

import { reducers, epics as coreEpics } from "@nteract/core";

const rootReducer = combineReducers({
  app: reducers.app,
  comms: reducers.comms,
  config: reducers.config,
  core: reducers.core
});

export default function configureStore(initialState: AppState) {
  const rootEpic = combineEpics(...coreEpics.allEpics);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
