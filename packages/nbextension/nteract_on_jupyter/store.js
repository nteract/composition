/* @flow */
import { createStore, applyMiddleware } from "redux";
import { createEpicMiddleware, combineEpics } from "redux-observable";

import { loadEpic } from "./epics/contents";

const rootReducer = (state, action) => {
  console.log("root reducer logger", action);
  switch (action.type) {
    case "LOADED":
      return Object.assign({}, state, { contents: action.payload });
  }
  return state;
};

type AppState = {};

export default function configureStore(initialState: AppState = {}) {
  const rootEpic = combineEpics(loadEpic);
  const middlewares = [createEpicMiddleware(rootEpic)];

  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
