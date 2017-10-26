/* @flow */
import { createStore, applyMiddleware, compose } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

import epics from "./epics";

const rootReducer = (state, action) => {
  switch (action.type) {
    case "LOADED":
      return Object.assign({}, state, { contents: action.payload });
    case "KERNELSPECS_LISTED":
      return Object.assign({}, state, { kernelspecs: action.payload });
  }
  return state;
};

type AppState = {};

export default function configureStore(initialState: AppState = {}) {
  const rootEpic = combineEpics(...epics);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
