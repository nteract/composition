// @flow
import { errorMiddleware } from "@nteract/core/middlewares";

import { createEpicMiddleware, combineEpics } from "redux-observable";

import epics from "./epics";

const rootEpic = combineEpics(...epics);

type Action = {
  type: string
};

const middlewares = [createEpicMiddleware(rootEpic), errorMiddleware];

export default middlewares;
