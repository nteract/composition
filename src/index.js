import React from 'react';
import ReactDOM from 'react-dom';

import createStore from './store';
import { reducers } from './reducers';
import Provider from './components/util/provider';
import Notebook from './components/notebook';

import {
  readNotebook,
  newKernel,
  save,
  saveAs,
  killKernel,
} from './actions';

const filename = decodeURIComponent(window.location.hash.slice(1));
const { store, dispatch } = createStore({ notebook: null, selected: [], filename }, reducers);

import { ipcRenderer as ipc } from 'electron';
ipc.on('menu:new-kernel', (e, name) => dispatch(newKernel(name)));
ipc.on('menu:save', () => dispatch(save()));
ipc.on('menu:save-as', (e, fn) => dispatch(saveAs(fn)));
ipc.on('menu:kill-kernel', () => dispatch(killKernel()));

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    store.subscribe(state => this.setState(state));
  }
  componentDidMount() {
    dispatch(readNotebook(filename));
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
              focused={this.state.focused} />
          }
        </div>
      </Provider>
    );
  }
}

App.displayName = 'App';

ReactDOM.render(
  <App/>,
  document.querySelector('#app')
);
