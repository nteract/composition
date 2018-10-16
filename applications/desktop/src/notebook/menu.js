/* @flow strict */
/* eslint-disable no-unused-vars, no-use-before-define */
import { ipcRenderer as ipc, webFrame, shell, remote } from "electron";

import * as path from "path";

import * as fs from "fs";

import { throttle } from "lodash";

import {
  actions,
  actionTypes,
  selectors,
  createKernelRef
} from "@nteract/core";
import type { AppState, ContentRef, KernelRef } from "@nteract/core";

import type { Store } from "redux";

import type { DesktopNotebookAppState } from "./state.js";

export function cwdKernelFallback() {
  // HACK: If we see they're at /, we assume that was the OS launching the Application
  //       from a launcher (launchctl on macOS)
  if (process.cwd() === "/") {
    return remote.app.getPath("home");
  }
  return process.cwd();
}

export function dispatchSaveAs(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  evt: Event,
  filepath: string
) {
  store.dispatch(actions.saveAs({ filepath, contentRef: ownProps.contentRef }));
}

const dialog = remote.dialog;

type SaveDialogOptions = {
  title: string,
  filters: Array<{ name: string, extensions: Array<string> }>,
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

    dialog.showSaveDialog(options, filepath => {
      // If there was a filepath set and the extension name for it is blank,
      // append `.ipynb`
      if (filepath && path.extname(filepath) === "") {
        resolve(`${filepath}.ipynb`);
        return;
      }
      // Adhere to the electron API by resolving undefined
      // This happens when the user cancels the dialog
      if (filepath === undefined) {
        resolve(filepath);
        return;
      }
      // Assume it was a good path otherwise
      resolve(filepath);
    });
  });
}

export function triggerWindowRefresh(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  filepath: string
) {
  if (!filepath) {
    return;
  }

  store.dispatch(actions.saveAs({ filepath, contentRef: ownProps.contentRef }));
}

export function dispatchRestartKernel(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  outputHandling: actionTypes.RestartKernelOutputHandling
) {
  const state = store.getState();
  const kernelRef = selectors.kernelRefByContentRef(state, ownProps);

  if (!kernelRef) {
    store.dispatch(actions.coreError(new Error("kernel not set")));
    return;
  }

  store.dispatch(
    actions.restartKernel({
      outputHandling: outputHandling,
      kernelRef,
      contentRef: ownProps.contentRef
    })
  );
}

export function promptUserAboutNewKernel(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  filepath: string
): Promise<*> {
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
          const state = store.getState();
          const oldKernelRef = selectors.kernelRefByContentRef(state, ownProps);
          if (!oldKernelRef) {
            console.error("kernel not available for relaunch");
            return;
          }
          const kernel = selectors.kernel(state, { kernelRef: oldKernelRef });
          if (!kernel) {
            console.error("kernel not available for relaunch");
            return;
          }

          const cwd = filepath
            ? path.dirname(path.resolve(filepath))
            : cwdKernelFallback();

          // Create a brand new kernel
          const kernelRef = createKernelRef();

          store.dispatch(
            actions.launchKernelByName({
              kernelSpecName: kernel.kernelSpecName,
              kernelType: kernel.type,
              cwd,
              selectNextKernel: true,
              kernelRef,
              contentRef: ownProps.contentRef
            })
          );
        }
        resolve();
      }
    );
  });
}

export function triggerSaveAs(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  showSaveAsDialog().then(filepath => {
    if (filepath) {
      triggerWindowRefresh(ownProps, store, filepath);
      promptUserAboutNewKernel(ownProps, store, filepath);
    }
  });
}

export function dispatchSave(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  const state = store.getState();

  const filepath = selectors.filepath(state, ownProps);

  if (filepath == null) {
    triggerSaveAs(ownProps, store);
  } else {
    store.dispatch(actions.save(ownProps));
  }
}

export function dispatchNewKernel(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  evt: Event,
  kernelSpec: KernelSpec
) {
  const state = store.getState();
  const filepath = selectors.filepath(state, ownProps);
  const cwd =
    filepath != null
      ? path.dirname(path.resolve(filepath))
      : cwdKernelFallback();

  // Create a brand new kernel
  const kernelRef = createKernelRef();

  store.dispatch(
    actions.launchKernel({
      kernelSpec,
      kernelType: "zeromq",
      cwd,
      selectNextKernel: true,
      kernelRef,
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchPublishGist(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  event: Event
) {
  const state = store.getState();
  let githubToken = state.app.get("githubToken");

  // The simple case -- we have a token and can publish
  if (githubToken != null) {
    store.dispatch(actions.publishGist(ownProps));
    return;
  }

  // If the Github Token isn't set, use our oauth server to acquire a token

  // Because the remote object from Electron main <--> renderer can be "cleaned up"
  // we re-require electron here and get the remote object
  const remote = require("electron").remote;

  // Create our oauth window
  const win = new remote.BrowserWindow({
    show: false,
    webPreferences: { zoomFactor: 0.75 }
  });

  // TODO: This needs to be moved to an epic
  win.webContents.on("dom-ready", () => {
    // When we're at our callback code page, keep the page hidden
    if (win.getURL().indexOf("callback?code=") !== -1) {
      // Extract the text content
      win.webContents.executeJavaScript(
        `require('electron').ipcRenderer.send('auth', document.body.textContent);`
      );
      remote.ipcMain.on("auth", (event, auth) => {
        try {
          const accessToken = JSON.parse(auth).access_token;
          store.dispatch(actions.setGithubToken(accessToken));

          const notificationSystem = selectors.notificationSystem(state);

          notificationSystem.addNotification({
            title: "Authenticated",
            message: `🔒`,
            level: "info"
          });

          // We are now authenticated and can finally publish
          store.dispatch(actions.publishGist(ownProps));
        } catch (e) {
          store.dispatch(actions.coreError(e));
        } finally {
          win.close();
        }
      });
    } else {
      win.show();
    }
  });
  win.loadURL("https://oauth.nteract.io/github");
}

export function dispatchRunAllBelow(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(actions.executeAllCellsBelow(ownProps));
}

export function dispatchRunAll(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(actions.executeAllCells(ownProps));
}

export function dispatchClearAll(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(actions.clearAllOutputs(ownProps));
}

export function dispatchUnhideAll(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(
    actions.unhideAll({
      outputHidden: false,
      inputHidden: false,
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchKillKernel(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  const state = store.getState();
  const kernelRef = selectors.kernelRefByContentRef(state, ownProps);
  if (!kernelRef) {
    store.dispatch(actions.coreError(new Error("kernel not set")));
    return;
  }

  store.dispatch(actions.killKernel({ restarting: false, kernelRef }));
}

export function dispatchInterruptKernel(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  const state = store.getState();

  const notificationSystem = selectors.notificationSystem(state);
  if (process.platform === "win32") {
    notificationSystem.addNotification({
      title: "Not supported in Windows",
      message: "Kernel interruption is not supported in Windows.",
      level: "error"
    });
  } else {
    const kernelRef = selectors.kernelRefByContentRef(state, ownProps);
    if (!kernelRef) {
      store.dispatch(actions.coreError(new Error("kernel not set")));
      return;
    }

    store.dispatch(actions.interruptKernel({ kernelRef }));
  }
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

export function dispatchSetTheme(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  evt: Event,
  theme: string
) {
  store.dispatch(actions.setTheme(theme));
}

export function dispatchSetCursorBlink(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  evt: Event,
  value: *
) {
  store.dispatch(actions.setCursorBlink(value));
}

export function dispatchCopyCell(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(actions.copyCell({ contentRef: ownProps.contentRef }));
}

export function dispatchCutCell(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(actions.cutCell({ contentRef: ownProps.contentRef }));
}

export function dispatchPasteCell(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(actions.pasteCell(ownProps));
}

export function dispatchDeleteCell(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(actions.removeCell({ contentRef: ownProps.contentRef }));
}

export function dispatchCreateCellAbove(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(
    actions.createCellBefore({
      cellType: "code",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchCreateCellBelow(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(
    actions.createCellAfter({
      cellType: "code",
      source: "",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchCreateTextCellBelow(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(
    actions.createCellAfter({
      cellType: "markdown",
      source: "",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchChangeCellToCode(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(
    actions.changeCellType({
      to: "code",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchChangeCellToText(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(
    actions.changeCellType({
      to: "markdown",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchLoad(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  event: Event,
  filepath: string
) {
  // We are loading a new document so we will create a kernelRef
  const kernelRef = createKernelRef();

  store.dispatch(
    actions.fetchContent({
      filepath,
      params: {},
      kernelRef,
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchNewNotebook(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  event: Event,
  kernelSpec: KernelSpec
) {
  // It's a brand new notebook so we create a kernelRef for it
  const kernelRef = createKernelRef();

  store.dispatch(
    // for desktop, we _can_ assume this has no path except for living in `cwd`
    // which I suppose _could_ be called `${cwd}/UntitledN.ipynb`
    // for jupyter extension, we _would_ call this `${cwd}/UntitledN.ipynb`

    actions.newNotebook({
      kernelSpec,
      cwd: cwdKernelFallback(),
      kernelRef,
      contentRef: ownProps.contentRef
    })
  );
}

/**
 * Print notebook to PDF.
 * It will expand all cell outputs before printing and restore cells it expanded when complete.
 *
 * @param {object} store - The Redux store
 * @param {string} basepath - basepath of the PDF to be saved.
 * @param {any} notificationSystem - reference to global notification system
 */
export function exportPDF(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>,
  basepath: string,
  notificationSystem: *
): void {
  const state = store.getState();

  const pdfPath = `${basepath}.pdf`;

  const model = selectors.model(state, ownProps);
  if (!model || model.type !== "notebook") {
    throw new Error(
      "Massive strangeness in the desktop app if someone is exporting a non-notebook to PDF"
    );
  }

  const unexpandedCells = selectors.notebook.hiddenCellIds(model);
  // TODO: we should not be modifying the document to print PDFs
  //       and we especially shouldn't be relying on all these actions to
  //       run through before we print...
  // Expand unexpanded cells
  unexpandedCells.map(cellID =>
    store.dispatch(
      actions.toggleOutputExpansion({
        id: cellID,
        contentRef: ownProps.contentRef
      })
    )
  );

  remote.getCurrentWindow().webContents.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error) throw error;

      // Restore the modified cells to their unexpanded state.
      unexpandedCells.map(cellID =>
        store.dispatch(
          actions.toggleOutputExpansion({
            id: cellID,
            contentRef: ownProps.contentRef
          })
        )
      );

      const notificationSystem = state.app.get("notificationSystem");

      fs.writeFile(pdfPath, data, error_fs => {
        notificationSystem.addNotification({
          title: "PDF exported",
          message: `Notebook ${basepath} has been exported as a pdf.`,
          dismissible: true,
          position: "tr",
          level: "success",
          action: {
            label: "Open PDF",
            callback: function openPDF() {
              shell.openItem(pdfPath);
            }
          }
        });
      });
    }
  );
}

export function triggerSaveAsPDF(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  showSaveAsDialog()
    .then(filepath => {
      if (filepath) {
        return Promise.all([
          triggerWindowRefresh(ownProps, store, filepath)
        ]).then(() => storeToPDF(ownProps, store));
      }
    })
    .catch(e => store.dispatch(actions.coreError(e)));
}

export function storeToPDF(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  const state = store.getState();
  const notebookName = selectors.filepath(state, ownProps);
  const notificationSystem = state.app.get("notificationSystem");
  if (notebookName == null) {
    notificationSystem.addNotification({
      title: "File has not been saved!",
      message: [
        "Click the button below to save the notebook so that it can be ",
        "exported as a PDF."
      ],
      dismissible: true,
      position: "tr",
      level: "warning",
      action: {
        label: "Save As",
        callback: function cb() {
          triggerSaveAsPDF(ownProps, store);
        }
      }
    });
  } else {
    const basename = path.basename(notebookName, ".ipynb");
    const basepath = path.join(path.dirname(notebookName), basename);
    exportPDF(ownProps, store, basepath, notificationSystem);
  }
}

export function dispatchLoadConfig(
  ownProps: { contentRef: ContentRef },
  store: Store<DesktopNotebookAppState, *>
) {
  store.dispatch(actions.loadConfig());
}

export function initMenuHandlers(
  contentRef: ContentRef,
  store: Store<DesktopNotebookAppState, *>
) {
  const opts = {
    contentRef
  };

  ipc.on("main:new", dispatchNewNotebook.bind(null, opts, store));
  ipc.on("menu:new-kernel", dispatchNewKernel.bind(null, opts, store));
  ipc.on("menu:run-all", dispatchRunAll.bind(null, opts, store));
  ipc.on("menu:run-all-below", dispatchRunAllBelow.bind(null, opts, store));
  ipc.on("menu:clear-all", dispatchClearAll.bind(null, opts, store));
  ipc.on("menu:unhide-all", dispatchUnhideAll.bind(null, opts, store));
  ipc.on("menu:save", throttle(dispatchSave.bind(null, opts, store), 2000));
  ipc.on("menu:save-as", dispatchSaveAs.bind(null, opts, store));
  ipc.on(
    "menu:new-text-cell-below",
    dispatchCreateTextCellBelow.bind(null, opts, store)
  );
  ipc.on(
    "menu:new-code-cell-above",
    dispatchCreateCellAbove.bind(null, opts, store)
  );
  ipc.on(
    "menu:new-code-cell-below",
    dispatchCreateCellBelow.bind(null, opts, store)
  );
  ipc.on("menu:copy-cell", dispatchCopyCell.bind(null, opts, store));
  ipc.on("menu:cut-cell", dispatchCutCell.bind(null, opts, store));
  ipc.on("menu:paste-cell", dispatchPasteCell.bind(null, opts, store));
  ipc.on("menu:delete-cell", dispatchDeleteCell.bind(null, opts, store));
  ipc.on(
    "menu:change-cell-to-code",
    dispatchChangeCellToCode.bind(null, opts, store)
  );
  ipc.on(
    "menu:change-cell-to-text",
    dispatchChangeCellToText.bind(null, opts, store)
  );
  ipc.on("menu:kill-kernel", dispatchKillKernel.bind(null, opts, store));
  ipc.on(
    "menu:interrupt-kernel",
    dispatchInterruptKernel.bind(null, opts, store)
  );
  ipc.on(
    "menu:restart-kernel",
    dispatchRestartKernel.bind(null, opts, store, "None")
  );
  ipc.on(
    "menu:restart-and-clear-all",
    dispatchRestartKernel.bind(null, opts, store, "Clear All")
  );
  ipc.on(
    "menu:restart-and-run-all",
    dispatchRestartKernel.bind(null, opts, store, "Run All")
  );
  ipc.on("menu:theme", dispatchSetTheme.bind(null, opts, store));
  ipc.on("menu:set-blink-rate", dispatchSetCursorBlink.bind(null, opts, store));
  ipc.on("menu:publish:gist", dispatchPublishGist.bind(null, opts, store));
  ipc.on("menu:exportPDF", storeToPDF.bind(null, opts, store));
  ipc.on("main:load", dispatchLoad.bind(null, opts, store));
  ipc.on("main:load-config", dispatchLoadConfig.bind(null, opts, store));

  /* Global non-content aware actions */
  ipc.on("menu:zoom-in", dispatchZoomIn);
  ipc.on("menu:zoom-out", dispatchZoomOut);
  ipc.on("menu:zoom-reset", dispatchZoomReset);
}
