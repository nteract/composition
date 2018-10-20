/* @flow strict */
import { middlewares as coreMiddlewares } from "@nteract/core";

import { createEpicMiddleware, combineEpics } from "redux-observable";

import logger from "./logger.js";
import epics from "./epics/index.js";

const rootEpic = combineEpics(...epics);

const middlewares = [
  createEpicMiddleware(rootEpic),
  coreMiddlewares.errorMiddleware
];

if (process.env.DEBUG === "true") {
  middlewares.push(logger());
}

export default middlewares;
