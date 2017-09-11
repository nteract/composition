/* @flow */
import { createStore, applyMiddleware } from "redux";

// import type { AppState } from "./records";
// import middlewares from "./middlewares";
// import rootReducer from "./reducers";

const middlewares = [];
const rootReducer = (state, action) => {
  console.log(action);
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
