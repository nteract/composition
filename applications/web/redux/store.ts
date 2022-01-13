import Immutable, { Record } from "immutable";
import { compose } from "redux";

import {
  AppState,
  AppRecord,
  CoreRecord,
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
import { notifications } from "@nteract/mythic-notifications";
import { makeConfigureStore } from "@nteract/myths";
import { Media } from "@nteract/outputs";
import { contents } from "rx-jupyter";
import { ServerConfig } from "@nteract/types";
import globalReducer from "./reducers"

const kernelspecsRef = createKernelspecsRef();

const composeEnhancers =
  typeof window !== "undefined"
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

interface logStruct {
  type: string,
  message: string
}

export interface GlobalRecord {
    // Toggle Values
    showBinderMenu: boolean,
    showConsole: boolean,
    showSaveDialog: boolean,
    // Git API Values
    filePath: string,
    fileContent: string,
    provider: string,
    org: string,
    repo: string,
    gitRef: string,
    // File info
    lang: string,
    // Commit Values
    commitMessage: string,
    // This should be a boolean value but as a string
    stripOutput: boolean,
    fileBuffer: object,
    savedTime: object,
    // Console 
    consoleLog: Array<logStruct>,
    notificationLog: Array<logStruct>,
    // Server
    serverStatus: string,
    host: ServerConfig,
   
    // Login Values
    loggedIn: boolean,
    username: string,
    userImage: string,
    userLink: string
}

// We define the state with the global state and inherited state
export interface State extends AppState {
  global: GlobalRecord,
  app: AppRecord,
  core: CoreRecord
}

// Initial state of the application
export const initialState = Record<State>({
  global: {
    showBinderMenu: false,
    showConsole: false,
    showSaveDialog: false,
    // Git API Values
    filePath: "",
    fileContent: "",
    provider: "github",
    org: "nteract",
    repo: "examples",
    gitRef: "master",
    // File info
    lang: "markdown",
    // Commit Values
    commitMessage: "Auto commit from nteract web",
    // This should be a boolean value but as a string
    stripOutput: false,
    fileBuffer: {},
    savedTime: new Date(),
  
    // Console 
    consoleLog: [],
    notificationLog: [],
    // Server
    serverStatus: "launching...",
    host: {
      crossDomain: true,
      endpoint: "",
      token: ""
    },
   
    // Login Values
    loggedIn: false,
    username: "",
    userImage: "",
    userLink: ""
  },
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


const configureStore = makeConfigureStore<State>()({
  packages: [notifications],
  reducers: {
    global: globalReducer,
    app: reducers.app,
    core: reducers.core as any,
  },
  epics: [...coreEpics.allEpics, coreEpics.launchKernelWhenNotebookSetEpic] as any,
  epicDependencies: { contentProvider: contents.JupyterContentProvider },
  enhancer: composeEnhancers,
});

export default () => configureStore(initialState);
