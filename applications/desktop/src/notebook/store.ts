import { middlewares as coreMiddlewares, reducers } from "@nteract/core";
import { configuration } from "@nteract/mythic-configuration";
import { notifications } from "@nteract/mythic-notifications";
import { makeConfigureStore } from "@nteract/myths";
import { Store } from "redux";
import epics from "./epics";
import { LocalContentProvider } from "./local-content-provider";
import { handleDesktopNotebook } from "./reducers";
import { DesktopNotebookAppState } from "./state";

export type DesktopStore = Store<DesktopNotebookAppState, any>;
export const configureStore = makeConfigureStore<DesktopNotebookAppState>()({
  packages: [
    configuration,
    notifications,
  ],
  reducers: {
    app: reducers.app,
    comms: reducers.comms,
    core: reducers.core as any,
    desktopNotebook: handleDesktopNotebook,
  },
  epics,
  epicMiddleware:
    process.env.DEBUG === "true"
      ? [coreMiddlewares.logger()]
      : [],
  epicDependencies: { contentProvider: new LocalContentProvider() },
});
export default configureStore;
