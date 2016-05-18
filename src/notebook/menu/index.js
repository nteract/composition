const path = require('path');

import {
  showSaveAsDialog,
} from '../api/save';

import { tildify } from '../native-window';

import {
  executeCell,
  newKernel,
  save,
  saveAs,
  killKernel,
} from '../actions';
import { ipcRenderer as ipc, webFrame, BrowserWindow } from 'electron';

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
      const { notebook, executionState } = store.getState();
      dispatch(saveAs(filename, notebook));
      BrowserWindow.getFocusedWindw().setTitle(`${tildify(filename)} - ${executionState}`);
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
  const { notebook, channels, notificationSystem, executionState } = store.getState();
  const cells = notebook.get('cellMap');
  const kernelConnected = channels &&
    !(executionState === 'starting' || executionState === 'not connected');
  notebook.get('cellOrder').map((value) => dispatch(
    executeCell(
      channels,
      value,
      cells.getIn([value, 'source']),
      kernelConnected,
      notificationSystem
    )
  ));
}

export function dispatchUndo(store, dispatch) {
  const { historyIndex, history} = store.getState();
  if (historyIndex == 0) {
    return;
  }
}

export function dispatchRedo(store, dispatch) {
  const { historyIndex, history} = store.getState();
  if (historyIndex == history.length - 1) {
    return;
  }
}

export function dispatchKillKernel(store, dispatch) {
  dispatch(killKernel);
}

export function dispatchZoomIn() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
}

export function dispatchZoomOut() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
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
  ipc.on('menu:zoom-in', dispatchZoomIn.bind(null, store, dispatch));
  ipc.on('menu:zoom-out', dispatchZoomOut.bind(null, store, dispatch));
}
