/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { Map as ImmutableMap } from "immutable";

import { document, comms, config } from "@nteract/core/reducers";
import { emptyNotebook, fromJS } from "@nteract/commutable";

import {
  makeAppRecord,
  AppRecord,
  DocumentRecord,
  CommsRecord
} from "@nteract/types/core/records";

export type AppState = {
  app: AppRecord,
  document: DocumentRecord,
  comms: CommsRecord,
  config: ImmutableMap<string, any>,
  contents: any
};

const rootReducer = combineReducers({
  app: (state = {}) => state,
  document,
  comms,
  config
});

const defaultState = {
  app: makeAppRecord(),
  document: DocumentRecord(),
  comms: CommsRecord(),
  config: ImmutableMap({
    theme: "light"
  })
};

const composeEnhancers =
  (typeof window !== "undefined" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

export default function configureStore() {
  const rootEpic = combineEpics(...[]);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    rootReducer,
    defaultState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
