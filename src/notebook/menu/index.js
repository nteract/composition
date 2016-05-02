const path = require('path');

import {
  showSaveAsDialog,
} from '../api/save';

import {
  executeCell,
  newKernel,
  save,
  saveAs,
  killKernel,
} from '../actions';
import { ipcRenderer as ipc } from 'electron';

import {
  publish,
} from '../publication/github';

export function dispatchSaveAs(store, dispatch, evt, filename) {
  const state = store.getState();
  const { notebook } = state;
  dispatch(saveAs(filename, notebook));
}

export function triggerSaveAs(store, dispatch) {
  showSaveAsDialog()
    .then(filename => {
      if (!filename) {
        return;
      }
      const { notebook } = store.getState();
      dispatch(saveAs(filename, notebook));
    }
  );
}

export function dispatchSave(store, dispatch) {
  const state = store.getState();
  const { notebook, filename } = state;
  if (!filename) {
    triggerSaveAs(store, dispatch);
  } else {
    dispatch(save(filename, notebook));
  }
}

export function dispatchNewkernel(store, dispatch, evt, name) {
  const state = store.getState();
  const spawnOptions = {};
  if (state && state.filename) {
    spawnOptions.cwd = path.dirname(path.resolve(state.filename));
  }
  dispatch(newKernel(name, spawnOptions));
}

export function dispatchPublishGist(store, dispatch) {
  const { notebook, filename, github, notificationSystem } = store.getState();
  const agenda = publish(github, notebook, filename, notificationSystem);

  agenda.subscribe((action) => {
    dispatch(action);
  }, (err) => {
    if (err.message) {
      const githubError = JSON.parse(err.message);
      if (githubError.message === 'Bad credentials') {
        notificationSystem.addNotification({
          title: 'Bad credentials',
          message: 'Unable to authenticate with your credentials.\n' +
                   'What do you have $GITHUB_TOKEN set to?',
          level: 'error',
        });
        return;
      }
      notificationSystem.addNotification({
        title: 'Publication Error',
        message: githubError.message,
        level: 'error',
      });
      return;
    }
    notificationSystem.addNotification({
      title: 'Unknown Publication Error',
      message: err.toString(),
      level: 'error',
    });
  });
}

export function dispatchRunAll(store, dispatch) {
  const { notebook, channels} = store.getState();
  const cells = notebook.get('cellMap');
  notebook.get('cellOrder').map((value, key) => {
    var cell = cells.get(value);
    dispatch(executeCell(channels, value, cell.get("source")));
  });
}

export function dispatchUndo(store, dispatch) {
}

export function dispatchRedo(store, dispatch) {
}

export function dispatchKillKernel(store, dispatch) {
  dispatch(killKernel);
}

export function initMenuHandlers(store, dispatch) {
  ipc.on('menu:new-kernel', dispatchNewkernel.bind(null, store, dispatch));
  ipc.on('menu:run-all', dispatchRunAll.bind(null, store, dispatch));
  ipc.on('menu:undo', dispatchRedo.bind(null, store, dispatch));
  ipc.on('menu:redo', dispatchUndo.bind(null, store, dispatch));
  ipc.on('menu:save', dispatchSave.bind(null, store, dispatch));
  ipc.on('menu:save-as', dispatchSaveAs.bind(null, store, dispatch));
  ipc.on('menu:kill-kernel', dispatchKillKernel.bind(null, store, dispatch));
  ipc.on('menu:publish:gist', dispatchPublishGist.bind(null, store, dispatch));
}
