import React from 'react';
import ReactDOM from 'react-dom';

import Immutable from 'immutable';

import createStore from './store';
import { reducers } from './reducers';
import Provider from './components/util/provider';
import Notebook from './components/notebook';

import NotificationSystem from 'react-notification-system';

import {
  setNotebook,
  setNotificationSystem,
  setExecutionState,
} from './actions';

import { ipcRenderer as ipc } from 'electron';
import storage from 'electron-json-storage';

import { initMenuHandlers } from './menu';
import { initNativeHandlers } from './native-window';
import { initGlobalHandlers } from './global-events';

const Github = require('github4');

const Rx = require('rxjs/Rx');

const github = new Github();

if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN,
  }, (x) => console.error(x));
}

ipc.on('main:load', (e, launchData) => {
  const { store, dispatch } = createStore({
    notebook: null,
    filename: launchData.filename,
    cellPagers: new Immutable.Map(),
    cellStatuses: new Immutable.Map(),
    history: new Immutable.List(),
    historyIndex: 0,
    executionState: 'not connected',
    github,
  }, reducers);

  store
    .pluck('channels')
    .distinctUntilChanged()
    .switchMap(channels => {
      if (!channels || !channels.iopub) {
        return Rx.Observable.of('not connected');
      }
      return channels
        .iopub
        .ofMessageType('status')
        .pluck('content', 'execution_state');
    })
    .subscribe(st => {
      dispatch(setExecutionState(st));
    });

  window.store = store;

  initNativeHandlers(store);
  initMenuHandlers(store, dispatch);
  initGlobalHandlers(store, dispatch);

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        theme: 'light',
      };
      store.subscribe(state => this.setState(state));
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
      dispatch(setNotificationSystem(this.refs.notificationSystem));
      const state = store.getState();
      const filename = (state && state.filename) || launchData.filename;
      dispatch(setNotebook(launchData.notebook, filename));
    }
    render() {
      return (
        <Provider rx={{ dispatch, store }}>
          <div>
            {
              this.state.err &&
                <pre>{this.state.err.toString()}</pre>
            }
            {
              this.state.notebook &&
                <Notebook
                  theme={this.state.theme}
                  notebook={this.state.notebook}
                  channels={this.state.channels}
                  cellPagers={this.state.cellPagers}
                  focusedCell={this.state.focusedCell}
                  cellStatuses={this.state.cellStatuses}
                />
            }
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
