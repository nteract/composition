import { middlewares as coreMiddlewares, reducers } from "@nteract/core";
import { configuration } from "@nteract/mythic-configuration";
import { languageInfo } from "@nteract/mythic-notebook";
import { notifications } from "@nteract/mythic-notifications";
import { windowing } from "@nteract/mythic-windowing";
import { makeConfigureStore, MythicAction } from "@nteract/myths";
import { Store } from "redux";
import epics from "./epics";
import { LocalContentProvider } from "./local-content-provider";
import { handleDesktopNotebook } from "./reducers";
import { DesktopNotebookAppState } from "./state";

export const configureStore : (initialState?: DesktopNotebookAppState) => Store<DesktopNotebookAppState, MythicAction> = makeConfigureStore<DesktopNotebookAppState>()({
  packages: [
    configuration,
    notifications,
    windowing,
    languageInfo,
  ],
  reducers: {
    app: reducers.app,
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
export type DesktopStore = ReturnType<typeof configureStore>;
