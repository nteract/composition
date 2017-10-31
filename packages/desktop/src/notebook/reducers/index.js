// @flow
import { combineReducers } from "redux";

import { document, metadata, comms, config } from "@nteract/core/reducers";
import app from "./app";

export default combineReducers({
  app,
  metadata,
  document,
  comms,
  config
});
