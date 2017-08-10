/* eslint-disable no-unused-vars, no-use-before-define */
import { ipcRenderer as ipc, webFrame, remote, shell } from "electron";

import * as path from "path";

import * as fs from "fs";

import { load, newNotebook } from "./epics/loading";

import { loadConfig } from "./epics/config";

import {
  changeInputVisibility,
  clearOutputs,
  copyCell,
  createCellAfter,
  cutCell,
  executeCell,
  interruptKernel,
  killKernel,
  newKernel,
  pasteCell,
  save,
  saveAs,
  setCursorBlink,
  setGithubToken,
  setTheme,
  toggleOutputExpansion
} from "./actions";

import { defaultPathFallback, cwdKernelFallback } from "./path";

export function dispatchSaveAs(store, evt, filename) {
  const state = store.getState();
  const notebook = state.document.get("notebook");
  store.dispatch(saveAs(filename, notebook));
}

const dialog = remote.dialog;

export function showSaveAsDialog() {
  return new Promise((resolve, reject) => {
    const opts = Object.assign(
      {
        title: "Save Notebook",
        filters: [{ name: "Notebooks", extensions: ["ipynb"] }]
      },
      defaultPathFallback()
    );

    const filename = dialog.showSaveDialog(opts);

    if (filename && path.extname(filename) === "") {
      resolve(`${filename}.ipynb`);
    }
    if (filename === undefined) {
      reject();
    }
    resolve(filename);
  });
}

export function triggerWindowRefresh(store, filename) {
  if (!filename) {
    return;
  }
  const state = store.getState();
  const notebook = state.document.get("notebook");
  store.dispatch(saveAs(filename, notebook));
}

export function dispatchRestartKernel(store) {
  const state = store.getState();
  const notificationSystem = state.app.get("notificationSystem");

  let cwd = cwdKernelFallback();
  if (state && state.document && state.metadata.get("filename")) {
    cwd = path.dirname(path.resolve(state.metadata.filename));
  }

  store.dispatch(killKernel);
  store.dispatch(newKernel(state.app.kernelSpec, cwd));

  notificationSystem.addNotification({
    title: "Kernel Restarted",
    message: `Kernel ${state.app.kernelSpecDisplayName} has been restarted.`,
    dismissible: true,
    position: "tr",
    level: "success"
  });
}

export function triggerKernelRefresh(store) {
  return new Promise(resolve => {
    dialog.showMessageBox(
      {
        type: "question",
        buttons: ["Launch New Kernel", "Don't Launch New Kernel"],
        title: "New Kernel Needs to Be Launched",
        message:
          "It looks like you've saved your notebook file to a new location.",
        detail:
          "The kernel executing your code thinks your notebook is still in the " +
          "old location. Would you like to launch a new kernel to match it with the " +
          "new location of the notebook?"
      },
      index => {
        if (index === 0) {
          dispatchRestartKernel(store);
        }
        resolve();
      }
    );
  });
}

export function triggerSaveAs(store) {
  showSaveAsDialog().then(filename => {
    triggerWindowRefresh(store, filename);
    triggerKernelRefresh(store);
  });
}

export function dispatchSave(store) {
  const state = store.getState();
  const notebook = state.document.get("notebook");
  const filename = state.metadata.get("filename");
  if (!filename) {
    triggerSaveAs(store);
  } else {
    store.dispatch(save(filename, notebook));
  }
}

export function dispatchNewKernel(store, evt, spec) {
  const state = store.getState();
  let cwd = cwdKernelFallback();
  if (state && state.document && state.metadata.get("filename")) {
    cwd = path.dirname(path.resolve(state.metadata.get("filename")));
  }
  store.dispatch(newKernel(spec, cwd));
}

export function dispatchPublishAnonGist(store) {
  store.dispatch({ type: "PUBLISH_ANONYMOUS_GIST" });
}

export function dispatchPublishUserGist(store, event, githubToken) {
  if (githubToken) {
    store.dispatch(setGithubToken(githubToken));
  }
  store.dispatch({ type: "PUBLISH_USER_GIST" });
}

/**
 * Redux dispatch function to run the focused cell and all cells below it.
 * It obtains the focused cell cell id and all code cell cell ids below.
 * It dispatches the {@link executeCell} action on all of those retrieved cells.
 *
 * @exports
 * @param {Object} store - The Redux store
 */
export function dispatchRunAllBelow(store) {
  const state = store.getState();
  const focusedCellId = state.document.get("cellFocused");
  const notebook = state.document.get("notebook");
  const indexOfFocusedCell = notebook.get("cellOrder").indexOf(focusedCellId);
  const cellsBelowFocusedId = notebook
    .get("cellOrder")
    .skip(indexOfFocusedCell);
  const cells = notebook.get("cellMap");

  cellsBelowFocusedId
    .filter(cellID => cells.getIn([cellID, "cell_type"]) === "code")
    .map(cellID =>
      store.dispatch(executeCell(cellID, cells.getIn([cellID, "source"])))
    );
}

export function dispatchRunAll(store) {
  const state = store.getState();
  const notebook = state.document.get("notebook");
  const cells = notebook.get("cellMap");
  notebook
    .get("cellOrder")
    .filter(cellID => cells.getIn([cellID, "cell_type"]) === "code")
    .map(cellID =>
      store.dispatch(executeCell(cellID, cells.getIn([cellID, "source"])))
    );
}

export function dispatchClearAll(store) {
  const state = store.getState();
  const notebook = state.document.get("notebook");
  notebook.get("cellOrder").map(value => store.dispatch(clearOutputs(value)));
}

export function dispatchUnhideAll(store) {
  const state = store.getState();
  const notebook = state.document.get("notebook");
  const cells = notebook.get("cellMap");
  notebook
    .get("cellOrder")
    .filter(cellID => cells.getIn([cellID, "metadata", "inputHidden"]))
    .map(cellID => store.dispatch(changeInputVisibility(cellID)));
}

export function dispatchKillKernel(store) {
  store.dispatch(killKernel);
}

export function dispatchInterruptKernel(store) {
  const state = store.getState();
  const notificationSystem = state.app.get("notificationSystem");
  if (process.platform === "win32") {
    notificationSystem.addNotification({
      title: "Not supported in Windows",
      message: "Kernel interruption is currently not supported in Windows.",
      level: "error"
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

export function dispatchSetCursorBlink(store, evt, value) {
  store.dispatch(setCursorBlink(value));
}

export function dispatchCopyCell(store) {
  const state = store.getState();
  const focused = state.document.get("cellFocused");
  store.dispatch(copyCell(focused));
}

export function dispatchCutCell(store) {
  const state = store.getState();
  const focused = state.document.get("cellFocused");
  store.dispatch(cutCell(focused));
}

export function dispatchPasteCell(store) {
  store.dispatch(pasteCell());
}

export function dispatchCreateCellAfter(store) {
  const state = store.getState();
  const focused = state.document.get("cellFocused");
  store.dispatch(createCellAfter("code", focused));
}

export function dispatchCreateTextCellAfter(store) {
  const state = store.getState();
  const focused = state.document.get("cellFocused");
  store.dispatch(createCellAfter("markdown", focused));
}

export function dispatchLoad(store, event, filename) {
  store.dispatch(load(filename));
}

export function dispatchNewNotebook(store, event, kernelSpec) {
  store.dispatch(newNotebook(kernelSpec, cwdKernelFallback()));
}

/**
 * Print the current notebook to PDF.
 * It will expand all cell outputs before printing and restore cells it expanded when complete.
 * 
 * @param {object} store - The Redux store 
 * @param {string} filename - filename of PDF to be saved.
 * @param {any} notificationSystem - reference to global notification system
 */
export function exportPDF(
  store: object,
  filename: string,
  notificationSystem
): void {
  const state = store.getState();
  const notebook = state.document.get("notebook");
  const cellMap = notebook.get("cellMap");
  const cellOrder = notebook.get("cellOrder");
  const unexpandedCells = cellOrder.filter(
    cellID => cellMap.getIn([cellID, "metadata", "outputHidden"]) === false
  );

  // Expand unexpanded cells
  unexpandedCells.map(cellID => store.dispatch(toggleOutputExpansion(cellID)));

  remote.getCurrentWindow().webContents.printToPDF({
    printBackground: true
  }, (error, data) => {
    if (error) throw error;

    // Restore the modified cells to their unexpanded state.
    unexpandedCells.map(cellID =>
      store.dispatch(toggleOutputExpansion(cellID))
    );

    fs.writeFile(`${filename}.pdf`, data, error_fs => {
      notificationSystem.addNotification({
        title: "PDF exported",
        message: `Notebook ${filename} has been exported as a pdf.`,
        dismissible: true,
        position: "tr",
        level: "success",
        action: {
          label: "Open PDF",
          callback: function openPDF() {
            shell.openItem(`${filename}.pdf`);
          }
        }
      });
    });
  });
}

export function triggerSaveAsPDF(store) {
  showSaveAsDialog()
    .then(filename =>
      Promise.all([
        triggerWindowRefresh(store, filename),
        triggerKernelRefresh(store)
      ])
    )
    .then(() => storeToPDF(store))
    .catch(e =>
      store.dispatch({ type: "ERROR", payload: e.message, error: true })
    );
}

export function storeToPDF(store) {
  const state = store.getState();
  let filename = path.basename(state.metadata.get("filename"), ".ipynb");
  const notificationSystem = state.app.get("notificationSystem");
  if (filename === "") {
    notificationSystem.addNotification({
      title: "File has not been saved!",
      message: [
        "Click the button below to save the notebook such that it can be ",
        "exported as a PDF."
      ],
      dismissible: true,
      position: "tr",
      level: "warning",
      action: {
        label: "Save As",
        callback: function cb() {
          triggerSaveAsPDF(store);
        }
      }
    });
  } else {
    filename = path.join(
      path.dirname(state.metadata.get("filename")),
      filename
    );
    exportPDF(store, filename, notificationSystem);
  }
}

export function dispatchLoadConfig(store) {
  store.dispatch(loadConfig());
}

export function initMenuHandlers(store) {
  ipc.on("main:new", dispatchNewNotebook.bind(null, store));
  ipc.on("menu:new-kernel", dispatchNewKernel.bind(null, store));
  ipc.on("menu:run-all", dispatchRunAll.bind(null, store));
  ipc.on("menu:run-all-below", dispatchRunAllBelow.bind(null, store));
  ipc.on("menu:clear-all", dispatchClearAll.bind(null, store));
  ipc.on("menu:unhide-all", dispatchUnhideAll.bind(null, store));
  ipc.on("menu:save", dispatchSave.bind(null, store));
  ipc.on("menu:save-as", dispatchSaveAs.bind(null, store));
  ipc.on("menu:new-code-cell", dispatchCreateCellAfter.bind(null, store));
  ipc.on("menu:new-text-cell", dispatchCreateTextCellAfter.bind(null, store));
  ipc.on("menu:copy-cell", dispatchCopyCell.bind(null, store));
  ipc.on("menu:cut-cell", dispatchCutCell.bind(null, store));
  ipc.on("menu:paste-cell", dispatchPasteCell.bind(null, store));
  ipc.on("menu:kill-kernel", dispatchKillKernel.bind(null, store));
  ipc.on("menu:interrupt-kernel", dispatchInterruptKernel.bind(null, store));
  ipc.on("menu:restart-kernel", dispatchRestartKernel.bind(null, store));
  ipc.on(
    "menu:restart-and-clear-all",
    dispatchRestartClearAll.bind(null, store)
  );
  ipc.on("menu:publish:gist", dispatchPublishAnonGist.bind(null, store));
  ipc.on("menu:zoom-in", dispatchZoomIn.bind(null, store));
  ipc.on("menu:zoom-out", dispatchZoomOut.bind(null, store));
  ipc.on("menu:zoom-reset", dispatchZoomReset.bind(null, store));
  ipc.on("menu:theme", dispatchSetTheme.bind(null, store));
  ipc.on("menu:set-blink-rate", dispatchSetCursorBlink.bind(null, store));
  ipc.on("menu:github:auth", dispatchPublishUserGist.bind(null, store));
  ipc.on("menu:exportPDF", storeToPDF.bind(null, store));
  // OCD: This is more like the registration of main -> renderer thread
  ipc.on("main:load", dispatchLoad.bind(null, store));
  ipc.on("main:load-config", dispatchLoadConfig.bind(null, store));
}
