import { combineReducers } from "redux";

import app from "./app";
import document from "./document";
import metadata from "./metadata";
import comms from "./comms";
import config from "./config";

export default combineReducers({
  app,
  metadata,
  document,
  comms,
  config
});
