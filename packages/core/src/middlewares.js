// @flow
// NOTE: These are just default middlewares here for now until I figure out how
// to divide up the desktop app and this core package

import * as selectors from "./selectors";

type Action = {
  type: string,
  payload: ?any
};

// Get the type
type Console = typeof console;

export const errorMiddleware = (
  store: any,
  console: Console = global.console
) => (next: any) => (action: Action) => {
  if (!action.type.includes("ERROR")) {
    return next(action);
  }
  console.error(action);
  let errorText;
  if ("payload" in action) {
    errorText = JSON.stringify(action.payload, null, 2);
  } else {
    errorText = JSON.stringify(action, null, 2);
  }

  const state = store.getState();
  const notificationSystem = selectors.notificationSystem(state);
  if (notificationSystem) {
    notificationSystem.addNotification({
      title: action.type,
      message: errorText,
      dismissible: true,
      position: "tr",
      level: "error"
    });
  }
  return next(action);
};
