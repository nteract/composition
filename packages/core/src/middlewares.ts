// NOTE: These are just default middlewares here for now until we figure out how
// to divide up the desktop app and this core package

import { isCollection } from "immutable";
import { createLogger } from "redux-logger";

import { Middleware } from "redux";

import * as selectors from "@nteract/selectors";

type ErrorAction = {
  type: string;
  error?: boolean;
  payload?: any;
};

export const errorMiddleware = (store: any, console = global.console) => (
  next: any
) => (action: ErrorAction) => {
  if (!(action.type.includes("ERROR") || (action as ErrorAction).error)) {
    return next(action);
  }
  console.error(action);
  let errorText;

  if (action.payload) {
    if (
      action.payload instanceof Object &&
      action.payload.error instanceof Error
    ) {
      errorText = action.payload.error.message;
    } else {
      errorText = JSON.stringify(action.payload, null, 2);
    }
  } else {
    errorText = JSON.stringify(action, null, 2);
  }

  const state = store.getState();
  const notificationSystem = selectors.notificationSystem(state);
  if (notificationSystem) {
    notificationSystem.addNotification({
      title: (action as ErrorAction).type,
      message: errorText,
      dismissible: true,
      position: "tr",
      level: "error"
    });
  }
  return next(action);
};

export function logger(): Middleware {
  const craftedLogger = createLogger({
    // predicate: (getState, action) => action.type.includes('COMM'),
    stateTransformer: (state: any) =>
      Object.keys(state).reduce(
        (prev, key) =>
          Object.assign({}, prev, {
            [key]: isCollection(state[key]) ? state[key].toJS() : state[key]
          }),
        {}
      )
  });
  return craftedLogger;
}
