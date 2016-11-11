import {
  ipcRenderer as ipc,
  webFrame,
  remote,
} from 'electron';

import * as path from 'path';

import { tildify } from './native-window';

import {
  PUBLISH_USER_GIST,
  PUBLISH_ANONYMOUS_GIST,
} from './constants';

import {
  load,
  newNotebook,
} from './epics/loading';

import {
  loadConfig,
} from './epics/config';

import {
  executeCell,
  clearCellOutput,
  newKernel,
  killKernel,
  interruptKernel,
  copyCell,
  cutCell,
  pasteCell,
  createCellAfter,
  setAnonGithub,
  setUserGithub,
  setGithubToken,
  changeInputVisibility,
  setTheme,
  save,
  saveAs,
} from './actions';

import {
  defaultPathFallback,
  cwdKernelFallback,
} from './path';

const BrowserWindow = remote.BrowserWindow;

export function dispatchSaveAs(store, evt, filename) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  store.dispatch(saveAs(filename, notebook));
}

const dialog = remote.dialog;

export function showSaveAsDialog(defaultPath) {
  return new Promise((resolve) => {
    const opts = Object.assign({
      title: 'Save Notebook',
      filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
    }, defaultPathFallback());

    const filename = dialog.showSaveDialog(opts);

    if (filename && path.extname(filename) === '') {
      resolve(`${filename}.ipynb`);
    }
    resolve(filename);
  });
}

export function triggerWindowRefresh(store, filename) {
  if (!filename) {
    return;
  }
  const state = store.getState();
  const executionState = state.app.get('executionState');
  const notebook = state.document.get('notebook');
  store.dispatch(saveAs(filename, notebook));
}

export function dispatchRestartKernel(store) {
  const state = store.getState();
  const notificationSystem = state.app.get('notificationSystem');

  let cwd = cwdKernelFallback();
  if (state && state.document && state.metadata.get('filename')) {
    cwd = path.dirname(path.resolve(state.metadata.filename));
  }

  store.dispatch(killKernel);
  store.dispatch(newKernel(state.app.kernelSpecName, cwd));

  notificationSystem.addNotification({
    title: 'Kernel Restarted',
    message: `Kernel ${state.app.kernelSpecName} has been restarted.`,
    dismissible: true,
    position: 'tr',
    level: 'success',
  });
}

export function triggerKernelRefresh(store) {
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Launch New Kernel', 'Don\'t Launch New Kernel'],
    title: 'New Kernel Needs to Be Launched',
    message: 'It looks like you\'ve saved your notebook file to a new location.',
    detail: 'The kernel executing your code thinks your notbook is still in the ' +
      'old location. Would you like to launch a new kernel to match it with the ' +
      'new location of the notebook?',
  }, (index) => {
    if (index === 0) {
      dispatchRestartKernel(store);
    }
  });
}

export function triggerSaveAs(store) {
  showSaveAsDialog()
    .then(filename => {
      triggerWindowRefresh(store, filename);
      triggerKernelRefresh(store);
    });
}

export function dispatchSave(store) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  const filename = state.metadata.get('filename');
  const notificationSystem = state.app.get('notificationSystem');
  try {
    if (!filename) {
      triggerSaveAs(store);
    } else {
      store.dispatch(save(filename, notebook));
    }
    notificationSystem.addNotification({
      title: 'Save successful!',
      autoDismiss: 2,
      level: 'success',
    });
  } catch (err) {
    notificationSystem.addNotification({
      title: 'Save failed!',
      message: err.message,
      level: 'error',
    });
  }
}

export function dispatchNewKernel(store, evt, name) {
  const state = store.getState();
  let cwd = cwdKernelFallback();
  if (state && state.document && state.metadata.get('filename')) {
    cwd = path.dirname(path.resolve(state.metadata.get('filename')));
  }
  store.dispatch(newKernel(name, cwd));
}

export function dispatchPublishAnonGist(store) {
  store.dispatch({ type: 'PUBLISH_ANONYMOUS_GIST' });
}

export function dispatchPublishUserGist(store, event, githubToken) {
  if (githubToken) {
    store.dispatch(setGithubToken(githubToken));
  }
  store.dispatch({ type: 'PUBLISH_USER_GIST' });
}


export function dispatchRunAll(store) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  const cells = notebook.get('cellMap');
  notebook.get('cellOrder').filter((cellID) =>
    cells.getIn([cellID, 'cell_type']) === 'code')
      .map((cellID) => store.dispatch(
        executeCell(
          cellID,
          cells.getIn([cellID, 'source'])
        )
  ));
}

export function dispatchClearAll(store) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  notebook.get('cellOrder').map((value) => store.dispatch(clearCellOutput(value)));
}

export function dispatchUnhideAll(store) {
  const state = store.getState();
  const notebook = state.document.get('notebook');
  const cells = notebook.get('cellMap');
  notebook.get('cellOrder')
    .filter((cellID) => cells.getIn([cellID, 'metadata', 'inputHidden']))
    .map((cellID) => store.dispatch(changeInputVisibility(cellID)));
}

export function dispatchKillKernel(store) {
  store.dispatch(killKernel);
}

export function dispatchInterruptKernel(store) {
  const state = store.getState();
  const notificationSystem = state.app.get('notificationSystem');
  if (process.platform === 'win32') {
    notificationSystem.addNotification({
      title: 'Not supported in Windows',
      message: 'Kernel interruption is currently not supported in Windows.',
      level: 'error',
    });
  } else {
    store.dispatch(interruptKernel);
  }
}

export function dispatchRestartClearAll(store) {
  dispatchRestartKernel(store);
  dispatchClearAll(store);
}

export function dispatchZoomIn() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
}

export function dispatchZoomOut() {
  webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
}

export function dispatchZoomReset() {
  webFrame.setZoomLevel(0);
}

export function dispatchSetTheme(store, evt, theme) {
  store.dispatch(setTheme(theme));
}

export function dispatchCopyCell(store) {
  const state = store.getState();
  const focused = state.document.get('focusedCell');
  store.dispatch(copyCell(focused));
}

export function dispatchCutCell(store) {
  const state = store.getState();
  const focused = state.document.get('focusedCell');
  store.dispatch(cutCell(focused));
}

export function dispatchPasteCell(store) {
  store.dispatch(pasteCell());
}

export function dispatchCreateCellAfter(store) {
  const state = store.getState();
  const focused = state.document.get('focusedCell');
  store.dispatch(createCellAfter('code', focused));
}

export function dispatchCreateTextCellAfter(store) {
  const state = store.getState();
  const focused = state.document.get('focusedCell');
  store.dispatch(createCellAfter('markdown', focused));
}

export function dispatchLoad(store, event, filename) {
  store.dispatch(load(filename));
}

export function dispatchNewNotebook(store, event, kernelSpecName) {
  store.dispatch(newNotebook(kernelSpecName, cwdKernelFallback()));
}


export function dispatchLoadConfig(store) {
  store.dispatch(loadConfig());
}

export function initMenuHandlers(store) {
  ipc.on('menu:new-kernel', dispatchNewKernel.bind(null, store));
  ipc.on('menu:run-all', dispatchRunAll.bind(null, store));
  ipc.on('menu:clear-all', dispatchClearAll.bind(null, store));
  ipc.on('menu:unhide-all', dispatchUnhideAll.bind(null, store));
  ipc.on('menu:save', dispatchSave.bind(null, store));
  ipc.on('menu:save-as', dispatchSaveAs.bind(null, store));
  ipc.on('menu:new-code-cell', dispatchCreateCellAfter.bind(null, store));
  ipc.on('menu:new-text-cell', dispatchCreateTextCellAfter.bind(null, store));
  ipc.on('menu:copy-cell', dispatchCopyCell.bind(null, store));
  ipc.on('menu:cut-cell', dispatchCutCell.bind(null, store));
  ipc.on('menu:paste-cell', dispatchPasteCell.bind(null, store));
  ipc.on('menu:kill-kernel', dispatchKillKernel.bind(null, store));
  ipc.on('menu:interrupt-kernel', dispatchInterruptKernel.bind(null, store));
  ipc.on('menu:restart-kernel', dispatchRestartKernel.bind(null, store));
  ipc.on('menu:restart-and-clear-all', dispatchRestartClearAll.bind(null, store));
  ipc.on('menu:publish:gist', dispatchPublishAnonGist.bind(null, store));
  ipc.on('menu:zoom-in', dispatchZoomIn.bind(null, store));
  ipc.on('menu:zoom-out', dispatchZoomOut.bind(null, store));
  ipc.on('menu:zoom-reset', dispatchZoomReset.bind(null, store));
  ipc.on('menu:theme', dispatchSetTheme.bind(null, store));
  ipc.on('menu:github:auth', dispatchPublishUserGist.bind(null, store));
  // OCD: This is more like the registration of main -> renderer thread
  ipc.on('main:load', dispatchLoad.bind(null, store));
  ipc.on('main:load-config', dispatchLoadConfig.bind(null, store));
  ipc.on('main:new', dispatchNewNotebook.bind(null, store));
}
