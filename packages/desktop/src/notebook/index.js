// @flow
import React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";

import { Map as ImmutableMap } from "immutable";

import NotificationSystem from "react-notification-system";

import configureStore from "./store";
import { reducers } from "./reducers";
import Notebook from "./components/notebook";

import { setNotificationSystem } from "./actions";

import { initMenuHandlers } from "./menu";
import { initNativeHandlers } from "./native-window";
import { initGlobalHandlers } from "./global-events";

import {
  AppRecord,
  DocumentRecord,
  MetadataRecord,
  CommsRecord
} from "./records";

const store = configureStore(
  {
    app: AppRecord(),
    metadata: MetadataRecord(),
    document: DocumentRecord(),
    comms: CommsRecord(),
    config: ImmutableMap({
      theme: "light"
    })
  },
  reducers
);

// Register for debugging
window.store = store;

initNativeHandlers(store);
initMenuHandlers(store);
initGlobalHandlers(store);

class App extends React.PureComponent {
  props: Object;
  state: Object;
  notificationSystem: NotificationSystem;

  componentDidMount(): void {
    store.dispatch(setNotificationSystem(this.notificationSystem));
  }

  render(): ?React.Element<any> {
    // eslint-disable-line class-methods-use-this
    return (
      <Provider store={store}>
        <div>
          <link rel="stylesheet" href="../static/styles/main.css" />
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
