import React from 'react';
import ReactDOM from 'react-dom';

import createStore from './store';
import { reducers } from './reducers';
import Provider from './components/util/provider';
import Notebook from './components/notebook';

import {
  setNotebook,
  setExecutionState,
} from './actions';

import { initKeymap } from './keys/keymap';
import { ipcRenderer as ipc } from 'electron';

import { initMenuHandlers } from './menu';
import { initNativeHandlers } from './native-window';

const Rx = require('@reactivex/rxjs');

ipc.on('main:load', (e, launchData) => {
  const { store, dispatch } = createStore({
    notebook: null,
    selected: null,
    filename: launchData.filename,
    executionState: 'not connected',
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

  initNativeHandlers(store);
  initKeymap(window, dispatch);
  initMenuHandlers(store, dispatch);

  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
      store.subscribe(state => this.setState(state));
    }
    componentDidMount() {
      dispatch(setNotebook(launchData.notebook));
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
                selected={this.state.selected}
                notebook={this.state.notebook}
                channels={this.state.channels}
              />
            }
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
