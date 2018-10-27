/* @flow strict */
import * as React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer as ipc, remote } from "electron";
import { Provider } from "react-redux";
import MathJax from "@nteract/mathjax";
import { mathJaxPath } from "mathjax-electron";
import NotificationSystem from "react-notification-system";
import { Styles } from "@nteract/presentational-components";
import {
  actions,
  createContentRef,
  makeAppRecord,
  makeStateRecord,
  makeContentsRecord,
  makeNotebookContentRecord,
  makeCommsRecord,
  makeLocalHostRecord,
  makeEntitiesRecord
} from "@nteract/core";
import type { ContentRef, ContentRecord } from "@nteract/core";
import NotebookApp from "@nteract/notebook-app-component";
import { displayOrder, transforms } from "@nteract/transforms-full";
import * as Immutable from "immutable";

import { initMenuHandlers } from "./menu";
import { initNativeHandlers } from "./native-window";
import { initGlobalHandlers } from "./global-events";
import { makeDesktopNotebookRecord } from "./state.js";
import configureStore from "./store";

// Load the nteract fonts
require("./fonts");

const contentRef = createContentRef();

const initialRefs: Immutable.Map<
  ContentRef,
  ContentRecord
> = Immutable.Map().set(contentRef, makeNotebookContentRecord());

const store = configureStore({
  app: makeAppRecord({
    host: makeLocalHostRecord(),
    version: remote.app.getVersion()
  }),
  comms: makeCommsRecord(),
  config: Immutable.Map({
    theme: "light"
  }),
  core: makeStateRecord({
    entities: makeEntitiesRecord({
      contents: makeContentsRecord({
        byRef: initialRefs
      })
    })
  }),
  desktopNotebook: makeDesktopNotebookRecord()
});

// Register for debugging
window.store = store;

initNativeHandlers(contentRef, store);
initMenuHandlers(contentRef, store);
initGlobalHandlers(contentRef, store);

export default class App extends React.PureComponent<{}, null> {
  notificationSystem: NotificationSystem;

  setNotificationSystemRef = (el: ?React.Element<typeof NotificationSystem>) => {
    this.notificationSystem = el;
  }

  componentDidMount(): void {
    store.dispatch(actions.setNotificationSystem(this.notificationSystem));
    ipc.send("react-ready");
  }

  render() {
    // eslint-disable-line class-methods-use-this
    return (
      <Provider store={store}>
        <React.Fragment>
          <Styles>
            <MathJax.Provider src={mathJaxPath} input="tex">
              <NotebookApp
                // The desktop app always keeps the same contentRef in a browser window
                contentRef={contentRef}
                transforms={transforms}
                displayOrder={displayOrder}
              />
            </MathJax.Provider>

            <NotificationSystem
              ref={this.setNotificationSystemRef}
            />
          </Styles>
          <style jsx global>{`
            body {
              font-family: "Source Sans Pro";
              font-size: 16px;
              background-color: var(--theme-app-bg);
              color: var(--theme-app-fg);
            }

            #app {
              padding-top: 20px;
            }

            @keyframes fadeOut {
              from {
                opacity: 1;
              }
              to {
                opacity: 0;
              }
            }

            div#loading {
              animation-name: fadeOut;
              animation-duration: 0.25s;
              animation-fill-mode: forwards;
            }
          `}</style>
        </React.Fragment>
      </Provider>
    );
  }
}

const app = document.querySelector("#app");
if (app) {
  ReactDOM.render(<App />, app);
} else {
  console.error("Failed to bootstrap the notebook app");
}
