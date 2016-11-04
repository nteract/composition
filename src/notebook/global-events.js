import {
  forceShutdownKernel,
} from './kernel/shutdown';

import { save } from './actions';

import { remote } from 'electron';
const dialog = remote.dialog;

export function beforeUnload(store, e) {
  const state = store.getState();
  const filename = state.metadata.filename;
  const notebook = state.document.notebook;
  dialog.showMessageBox(remote.getCurrentWindow(), {
    type: 'question',
    button: ['Save', 'Don\'t Save'],
    defaultId: 0,
    title: 'Save Notebook',
    message: 'Save notebook before closing?',
    detail: 'Would you like to save this notebook before closing?',
  }, (index) => {
    if (index === 0) {
      store.dispatch(save(filename, notebook));
    }
  }); 
}

export function unload(store) {
  const state = store.getState();
  const kernel = {
    channels: state.app.channels,
    spawn: state.app.spawn,
    connectionFile: state.app.connectionFile,
  };
  forceShutdownKernel(kernel);
}

export function initGlobalHandlers(store) {
  global.window.onbeforeunload = beforeUnload.bind(null, store);
  global.window.onunload = unload.bind(null, store);
}
