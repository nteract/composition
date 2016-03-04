import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';

import createStore from './store';
import App from './components/app';

import {
  setNotebook,
  newKernel,
  save,
  saveAs,
  killKernel,
} from './actions';
import { initKeymap } from './actions/keymap';
import { ipcRenderer as ipc } from 'electron';

ipc.on('main:load', (e, launchData) => {
  const store = createStore(launchData);
  const { dispatch } = store;

  initKeymap(window, dispatch);

  dispatch(setNotebook(launchData.notebook));

  ipc.on('menu:new-kernel', (e, name) => dispatch(newKernel(name)));
  ipc.on('menu:save', () => dispatch(save()));
  ipc.on('menu:save-as', (e, fn) => dispatch(saveAs(fn)));
  ipc.on('menu:kill-kernel', () => dispatch(killKernel()));

  const appNode = document.querySelector('#app');

  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    appNode
  );
});
