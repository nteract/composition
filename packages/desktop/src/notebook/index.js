// @flow
import React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer as ipc } from "electron";

import { Provider } from "react-redux";

import { Map as ImmutableMap } from "immutable";

import NotificationSystem from "react-notification-system";

import configureStore from "./store";
import { Notebook } from "@nteract/core/components";

import { setNotificationSystem } from "@nteract/core/actions";

import { initMenuHandlers } from "./menu";
import { initNativeHandlers } from "./native-window";
import { initGlobalHandlers } from "./global-events";

import {
  AppRecord,
  DocumentRecord,
  MetadataRecord,
  CommsRecord
} from "@nteract/core/records";

import "./main.css";

const store = configureStore({
  app: AppRecord(),
  metadata: MetadataRecord(),
  document: DocumentRecord(),
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
        <div>
          <Notebook />
          <NotificationSystem
            ref={notificationSystem => {
              this.notificationSystem = notificationSystem;
            }}
          />
        </div>
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#app"));
