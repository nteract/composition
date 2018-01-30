// @flow
import * as React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer as ipc, remote } from "electron";

import { Provider } from "react-redux";

import { Map as ImmutableMap } from "immutable";

import NotificationSystem from "react-notification-system";

import configureStore from "./store";

import { NotebookApp, KeyboardShortcuts } from "@nteract/core/providers";

import { setNotificationSystem } from "@nteract/core/actions";

import { displayOrder, transforms } from "@nteract/transforms-full";

import { initMenuHandlers } from "./menu";
import { initNativeHandlers } from "./native-window";
import { initGlobalHandlers } from "./global-events";

import {
  makeAppRecord,
  makeDesktopHostRecord,
  makeDocumentRecord,
  CommsRecord
} from "@nteract/types/core/records";

import "./main.css";

const store = configureStore({
  app: makeAppRecord({
    host: makeDesktopHostRecord(),
    version: remote.app.getVersion()
  }),
  document: makeDocumentRecord(),
  comms: CommsRecord(),
  config: ImmutableMap({
    theme: "light"
  })
});

// Register for debugging
window.store = store;

initNativeHandlers(store);
initMenuHandlers(store);
initGlobalHandlers(store);

export default class App extends React.PureComponent<Object, Object> {
  notificationSystem: NotificationSystem;

  componentDidMount(): void {
    store.dispatch(setNotificationSystem(this.notificationSystem));
    ipc.send("react-ready");
  }

  render(): ?React$Element<any> {
    // eslint-disable-line class-methods-use-this
    return (
      <Provider store={store}>
        <React.Fragment>
          <KeyboardShortcuts>
            <NotebookApp transforms={transforms} displayOrder={displayOrder} />
            <NotificationSystem
              ref={notificationSystem => {
                this.notificationSystem = notificationSystem;
              }}
            />
          </KeyboardShortcuts>
          <style jsx global>{`
            body {
              font-family: "Source Sans Pro";
              font-size: 16px;
              line-height: 22px;
              background-color: var(--main-bg-color);
              color: var(--main-fg-color);
              /* All the old theme setups declared this, putting it back for consistency */
              line-height: 1.3 !important;
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
