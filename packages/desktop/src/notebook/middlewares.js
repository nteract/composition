// @flow
import { createEpicMiddleware, combineEpics } from "redux-observable";

import epics from "./epics";

const rootEpic = combineEpics(...epics);

type Action = {
  type: string
};

export const errorMiddleware = (store: any) => (next: any) => (
  action: Action
) => {
  if (!action.type.includes("ERROR")) {
    return next(action);
  }
  console.error(action);
  let errorText;
  if (action.payload) {
    errorText = JSON.stringify(action.payload, null, 2);
  } else {
    errorText = JSON.stringify(action, null, 2);
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
