// @flow
/* eslint-disable no-unused-vars, no-use-before-define */
import { ipcRenderer as ipc, webFrame, remote, shell } from "electron";

import * as path from "path";

import * as fs from "fs";

import { throttle } from "lodash";

import * as actions from "@nteract/core/actions";

import * as selectors from "@nteract/core/selectors";

export function cwdKernelFallback() {
  // HACK: If we see they're at /, we assume that was the OS launching the Application
  //       from a launcher (launchctl on macOS)
  if (process.cwd() === "/") {
    return remote.app.getPath("home");
  }
  return process.cwd();
}

export function dispatchSaveAs(store: *, evt: Event, filename: string) {
  store.dispatch(actions.saveAs(filename));
}

const dialog = remote.dialog;

type SaveDialogOptions = {
  title: string,
  filters: Array<Object>,
  defaultPath?: string
};

export function showSaveAsDialog(): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: SaveDialogOptions = {
      title: "Save Notebook",
      filters: [{ name: "Notebooks", extensions: ["ipynb"] }]
    };

    // In Electron, we want an object we can merge into dialog opts, falling back
    // to the defaults from the dialog by not defining defaultPath. Electron treats
    // a literal undefined differently than this not being set.
    const defaultPath = cwdKernelFallback();
    if (process.cwd() !== defaultPath) {
      options.defaultPath = defaultPath;
    }

    dialog.showSaveDialog(options, filename => {
      // If there was a filename set and the extension name for it is blank,
      // append `.ipynb`
      if (filename && path.extname(filename) === "") {
        resolve(`${filename}.ipynb`);
        return;
      }
      // Adhere to the electron API by resolving undefined
      // This happens when the user cancels the dialog
      if (filename === undefined) {
        resolve(filename);
        return;
      }
      // Assume it was a good path otherwise
      resolve(filename);
    });
  });
}

export function triggerWindowRefresh(store: *, filename: string) {
  if (!filename) {
    return;
  }
  store.dispatch(actions.saveAs(filename));
}

export function dispatchRestartKernel(store: *) {
  store.dispatch(actions.restartKernel());
}

export function triggerKernelRefresh(store: *, filename: string): Promise<*> {
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
          const kernel = selectors.currentKernel(store.getState());
          const cwd = filename
            ? path.dirname(path.resolve(filename))
            : cwdKernelFallback();
          store.dispatch(
            actions.launchKernelByName(kernel.kernelSpecName, cwd)
          );
        }
        resolve();
      }
    );
  });
}

export function triggerSaveAs(store: *) {
  showSaveAsDialog().then(filename => {
    if (filename) {
      triggerWindowRefresh(store, filename);
      triggerKernelRefresh(store, filename);
    }
  });
}

export function dispatchSave(store: *) {
  const filename = selectors.currentFilename(store.getState());
  if (!filename) {
    triggerSaveAs(store);
  } else {
    store.dispatch(actions.save());
  }
}

export function dispatchNewKernel(store: *, evt: Event, spec: Object) {
  const filename = selectors.currentFilename(store.getState());
  const cwd = filename
    ? path.dirname(path.resolve(filename))
    : cwdKernelFallback();
  store.dispatch(actions.launchKernel(spec, cwd));
}

export function dispatchPublishAnonGist(store: *) {
  store.dispatch({ type: "PUBLISH_ANONYMOUS_GIST" });
}

export function dispatchPublishUserGist(
  store: *,
  event: Event,
  githubToken: string
) {
  if (githubToken) {
    store.dispatch(actions.setGithubToken(githubToken));
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
export function dispatchRunAllBelow(store: *) {
  store.dispatch(actions.executeAllCellsBelow());
}

export function dispatchRunAll(store: *) {
  store.dispatch(actions.executeAllCells());
}

export function dispatchClearAll(store: *) {
  store.dispatch(actions.clearAllOutputs());
}

export function dispatchUnhideAll(store: *) {
  store.dispatch(actions.unhideAll());
}

export function dispatchKillKernel(store: *) {
  store.dispatch(actions.killKernel());
}

export function dispatchInterruptKernel(store: *) {
  const state = store.getState();
  const notificationSystem = state.app.get("notificationSystem");
  if (process.platform === "win32") {
    notificationSystem.addNotification({
      title: "Not supported in Windows",
      message: "Kernel interruption is currently not supported in Windows.",
      level: "error"
    });
  } else {
    store.dispatch(actions.interruptKernel());
  }
}

export function dispatchRestartClearAll(store: *) {
  store.dispatch(actions.restartKernel({ clearOutputs: true }));
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

export function dispatchSetTheme(store: *, evt: Event, theme: string) {
  store.dispatch(actions.setTheme(theme));
}

export function dispatchSetCursorBlink(store: *, evt: Event, value: *) {
  store.dispatch(actions.setCursorBlink(value));
}

export function dispatchCopyCell(store: *) {
  const state = store.getState();
  const focused = state.document.get("cellFocused");
  store.dispatch(actions.copyCell(focused));
}

export function dispatchCutCell(store: *) {
  const state = store.getState();
  const focused = state.document.get("cellFocused");
  store.dispatch(actions.cutCell(focused));
}

export function dispatchPasteCell(store: *) {
  store.dispatch(actions.pasteCell());
}

export function dispatchCreateCellAfter(store: *) {
  const state = store.getState();
  const focused = state.document.get("cellFocused");
  store.dispatch(actions.createCellAfter("code", focused));
}

export function dispatchCreateTextCellAfter(store: *) {
  const state = store.getState();
  const focused = state.document.get("cellFocused");
  store.dispatch(actions.createCellAfter("markdown", focused));
}

export function dispatchLoad(store: *, event: Event, filename: string) {
  store.dispatch(actions.fetchContent({ path: filename }));
}

export function dispatchNewNotebook(
  store: *,
  event: Event,
  kernelSpec: Object
) {
  store.dispatch(actions.newNotebook(kernelSpec, cwdKernelFallback()));
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
  store: *,
  filename: string,
  notificationSystem: *
): void {
  const state = store.getState();
  const notebook = state.document.get("notebook");
  const cellMap = notebook.get("cellMap");
  const cellOrder = notebook.get("cellOrder");
  const unexpandedCells = cellOrder.filter(
    cellID => cellMap.getIn([cellID, "metadata", "outputHidden"]) === false
  );

  // Expand unexpanded cells
  unexpandedCells.map(cellID =>
    store.dispatch(actions.toggleOutputExpansion(cellID))
  );

  remote.getCurrentWindow().webContents.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error) throw error;

      // Restore the modified cells to their unexpanded state.
      unexpandedCells.map(cellID =>
        store.dispatch(actions.toggleOutputExpansion(cellID))
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
    }
  );
}

export function triggerSaveAsPDF(store: *) {
  showSaveAsDialog()
    .then(filename => {
      if (filename) {
        return Promise.all([triggerWindowRefresh(store, filename)]).then(() =>
          storeToPDF(store)
        );
      }
    })
    .catch(e =>
      store.dispatch({ type: "ERROR", payload: e.message, error: true })
    );
}

export function storeToPDF(store: *) {
  const state = store.getState();
  let filename = path.basename(state.document.get("filename"), ".ipynb");
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
      path.dirname(state.document.get("filename")),
      filename
    );
    exportPDF(store, filename, notificationSystem);
  }
}

export function dispatchLoadConfig(store: *) {
  store.dispatch(actions.loadConfig());
}

export function initMenuHandlers(store: *) {
  ipc.on("main:new", dispatchNewNotebook.bind(null, store));
  ipc.on("menu:new-kernel", dispatchNewKernel.bind(null, store));
  ipc.on("menu:run-all", dispatchRunAll.bind(null, store));
  ipc.on("menu:run-all-below", dispatchRunAllBelow.bind(null, store));
  ipc.on("menu:clear-all", dispatchClearAll.bind(null, store));
  ipc.on("menu:unhide-all", dispatchUnhideAll.bind(null, store));
  ipc.on("menu:save", throttle(dispatchSave.bind(null, store), 2000));
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
  ipc.on("menu:zoom-in", dispatchZoomIn);
  ipc.on("menu:zoom-out", dispatchZoomOut);
  ipc.on("menu:zoom-reset", dispatchZoomReset);
  ipc.on("menu:theme", dispatchSetTheme.bind(null, store));
  ipc.on("menu:set-blink-rate", dispatchSetCursorBlink.bind(null, store));
  ipc.on("menu:github:auth", dispatchPublishUserGist.bind(null, store));
  ipc.on("menu:exportPDF", storeToPDF.bind(null, store));
  // OCD: This is more like the registration of main -> renderer thread
  ipc.on("main:load", dispatchLoad.bind(null, store));
  ipc.on("main:load-config", dispatchLoadConfig.bind(null, store));
}
