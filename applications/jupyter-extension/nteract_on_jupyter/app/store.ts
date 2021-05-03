import { AppState, epics as coreEpics, reducers } from "@nteract/core";
import { notifications } from "@nteract/mythic-notifications";
import { makeConfigureStore } from "@nteract/myths";
import { compose } from "redux";
import { contents } from "rx-jupyter";

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const ignore = (state={}, action) => state;

export const configureStore = makeConfigureStore<AppState>()({
  packages: [notifications],
  reducers: {
    app: reducers.app,
    core: reducers.core as any,
    comms: ignore,
    config: ignore
  },
  epics: coreEpics.allEpics,
  epicDependencies: { contentProvider: contents.JupyterContentProvider },
  enhancer: composeEnhancers,
});
export default configureStore;
