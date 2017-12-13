/* @flow */
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { List as ImmutableList, Map as ImmutableMap } from "immutable";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

import { document, comms, config } from "@nteract/core/reducers";

import { AppRecord, DocumentRecord, CommsRecord } from "@nteract/core/records";

import epics from "./epics";

const webAppReducer = (state = {}, action) => {
  switch (action.type) {
    case "LOADED":
      return Object.assign({}, state, { contents: action.payload });
    case "KERNELSPECS_LISTED":
      return Object.assign({}, state, { kernelspecs: action.payload });
  }
  return state;
};

export type AppState = {
  app: AppRecord,
  document: DocumentRecord,
  comms: CommsRecord,
  config: ImmutableMap<string, any>,
  contents: any
};

const rootReducer = combineReducers({
  webApp: webAppReducer,
  app: (state = {}) => state,
  document,
  comms,
  config
});

const defaultState = {
  app: AppRecord(),
  document: DocumentRecord(),
  comms: CommsRecord(),
  config: ImmutableMap({
    theme: "light"
  })
};

export default function configureStore(config: any) {
  const initialState = Object.assign({}, { webApp: config }, defaultState);

  const rootEpic = combineEpics(...epics);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
