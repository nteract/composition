import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import { Provider } from 'react-redux';

import NotificationSystem from 'react-notification-system';

import { ipcRenderer as ipc } from 'electron';
import storage from 'electron-json-storage';

import configureStore from './store';
import { reducers } from './reducers';
import Notebook from './components/notebook';

import {
  setNotebook,
  setNotificationSystem,
} from './actions';

import { initMenuHandlers } from './menu';
import { initNativeHandlers } from './native-window';
import { initGlobalHandlers } from './global-events';

import { AppRecord, DocumentRecord, MetadataRecord } from './records';
import {
  widgetManager,
} from './widgets';

const Github = require('github');

const github = new Github();

if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN,
  }, (x) => console.error(x));
}

ipc.on('main:load', (e, launchData) => {
  const store = configureStore({
    app: new AppRecord({
      github,
    }),
    metadata: new MetadataRecord({
      filename: launchData.filename,
    }),
    document: {
      past: [],
      present: new DocumentRecord(),
      future: [],
    },
  }, reducers);

  // Register for debugging
  window.store = store;

  initNativeHandlers(store);
  initMenuHandlers(store);
  initGlobalHandlers(store);

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
      this.state = {
        theme: 'light',
      };
      storage.get('theme', (error, data) => {
        if (error) throw error;
        if (Object.keys(data).length === 0) return;
        this.setState({
          theme: data.theme,
        });
      });
      ipc.on('menu:theme', (ev, theme) => {
        storage.set('theme', { theme });
        this.setState({ theme });
      });
    }
    componentDidMount() {
      store.dispatch(setNotificationSystem(this.refs.notificationSystem));
      const state = store.getState();
      const filename = (state && state.metadata.filename) || launchData.filename;
      store.dispatch(setNotebook(launchData.notebook, filename));
    }
    render() {
      return (
        <Provider store={store}>
          <div>
            {
              this.state.err &&
                <pre>{this.state.err.toString()}</pre>
            }
            <Notebook widgetManager={widgetManager()} />
            <NotificationSystem ref="notificationSystem" />
            <link rel="stylesheet" href="../static/styles/main.css" />
            <link rel="stylesheet" href={`../static/styles/theme-${this.state.theme}.css`} />
          </div>
        </Provider>
      );
    }
  }

  ReactDOM.render(
    <App />,
    document.querySelector('#app')
  );
});
