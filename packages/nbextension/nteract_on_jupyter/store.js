/* @flow */
import { createStore, applyMiddleware } from "redux";

import { createEpicMiddleware, combineEpics } from "redux-observable";

import epics from "./epics";
const rootEpic = combineEpics(...epics);

// import type { AppState } from "./records";
// import middlewares from "./middlewares";
// import rootReducer from "./reducers";

const middlewares = [createEpicMiddleware(rootEpic)];

const rootReducer = (state, action) => {
  console.log("root reducer", action);
  return state;
};

type AppState = {};

export default function configureStore(initialState: AppState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
