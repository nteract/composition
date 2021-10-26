import Immutable, { Record } from "immutable";
import { compose } from "redux";

import {
  AppState,
  ContentRecord,
  createKernelspecsRef,
  epics as coreEpics,
  HostRecord,
  makeAppRecord,
  makeContentsRecord,
  makeEntitiesRecord,
  makeHostsRecord,
  makeStateRecord,
  makeTransformsRecord,
  reducers,
} from "@nteract/core";
import { languageInfo } from "@nteract/mythic-notebook";
import { notifications } from "@nteract/mythic-notifications";
import { makeConfigureStore } from "@nteract/myths";
import { Media } from "@nteract/outputs";
import { contents } from "rx-jupyter";

const kernelspecsRef = createKernelspecsRef();

const composeEnhancers =
  typeof window !== "undefined"
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

export const initialState = Record<AppState>({
  app: makeAppRecord({
    version: "@nteract/web",
  }),
  core: makeStateRecord({
    currentKernelspecsRef: kernelspecsRef,
    entities: makeEntitiesRecord({
      hosts: makeHostsRecord({
        byRef: Immutable.Map<string, HostRecord>(),
      }),
      contents: makeContentsRecord({
        byRef: Immutable.Map<string, ContentRecord>(),
      }),
      transforms: makeTransformsRecord({
        displayOrder: Immutable.List([
          "application/json",
          "application/javascript",
          "text/html",
          "text/markdown",
          "text/latex",
          "image/svg+xml",
          "image/gif",
          "image/png",
          "image/jpeg",
          "text/plain",
        ]),
        byId: Immutable.Map({
          "application/json": Media.Json,
          "application/javascript": Media.JavaScript,
          "text/html": Media.HTML,
          "text/markdown": Media.Markdown,
          "text/latex": Media.LaTeX,
          "image/svg+xml": Media.SVG,
          "image/gif": Media.Image,
          "image/png": Media.Image,
          "image/jpeg": Media.Image,
          "text/plain": Media.Plain,
        }),
      }),
    }),
  }),
})();

const configureStore = makeConfigureStore<AppState>()({
  packages: [notifications, languageInfo],
  reducers: {
    app: reducers.app,
    core: reducers.core as any,
  },
  epics: [...coreEpics.allEpics, coreEpics.launchKernelWhenNotebookSetEpic] as any,
  epicDependencies: { contentProvider: contents.JupyterContentProvider },
  enhancer: composeEnhancers,
});

export default () => configureStore(initialState);
