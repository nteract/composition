// @flow
import { errorMiddleware } from "@nteract/core/middlewares";

import { createEpicMiddleware, combineEpics } from "redux-observable";

import epics from "./epics";

const rootEpic = combineEpics(...epics);

type Action = {
  type: string
};

const middlewares = [createEpicMiddleware(rootEpic), errorMiddleware];

if (process.env.DEBUG === "true") {
  const logger = require("./logger"); // eslint-disable-line global-require

  middlewares.push(logger());
}

export default middlewares;
