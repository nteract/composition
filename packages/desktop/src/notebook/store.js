/* @flow */
import { createStore, applyMiddleware, combineReducers } from "redux";

import type { AppState } from "@nteract/core/records";

import middlewares from "./middlewares";
import rootReducer from "./reducers";

// NOTE: This is likely to be created by the apps directly using `createStore` from redux,
//       piecing together the reducers and middlewares they want
export default function configureStore(initialState: AppState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
