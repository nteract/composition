import { createEpicMiddleware, combineEpics } from "redux-observable";

import epics from "./epics";

const rootEpic = combineEpics(...epics);

export const errorMiddleware = store => next => action => {
  if (!action.type.includes("ERROR")) {
    return next(action);
  }
  console.error(action);
  let errorText;
  if (action.payload) {
    errorText = JSON.stringify(action.payload, 2, 2);
  } else {
    errorText = JSON.stringify(action, 2, 2);
  }
  const state = store.getState();
  const notificationSystem = state.app.get("notificationSystem");
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

const middlewares = [createEpicMiddleware(rootEpic), errorMiddleware];

export default middlewares;
