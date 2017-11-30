// @flow
import { combineReducers } from "redux";

import { document, comms, config } from "@nteract/core/reducers";
import app from "./app";

export default combineReducers({
  app,
  document,
  comms,
  config
});
