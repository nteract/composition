import { Breadcrumbs } from "@blueprintjs/core";
import { setCursorBlink } from "@nteract/actions/lib/actionTypes/config";
import { actions, ContentRef, createKernelRef, selectors } from "@nteract/core";
import { loadConfig, setTheme } from "@nteract/mythic-configuration";
import { sendNotification } from "@nteract/mythic-notifications";
import { ipcRenderer as ipc, remote, shell, webFrame } from "electron";
import * as fs from "fs";
import throttle from "lodash.throttle";
import * as path from "path";
import React from "react";
import styled from "styled-components";
import { setDefaultKernel } from "./config-options";
import { DesktopStore } from "./store";

type NotificationSystemRef = any;
type KernelSpec = any;

function isWriteable(pathToCheck: string): boolean {
  try {
    fs.accessSync(pathToCheck, fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function getDocumentDirectory(): string {
  const cwd = path.normalize(process.cwd());
  const cwdIsProperDocumentDirectory =
    // launchctl on macOS might set the path to "/"
    cwd !== "/" &&
    // cwd was likely set from nteract executable
    cwd !== path.normalize(path.dirname(process.execPath)) &&
    // document dir needs to be writeable
    isWriteable(cwd);

  return cwdIsProperDocumentDirectory ? cwd : remote.app.getPath("documents");
}

export function dispatchSaveAs(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  _evt: Event,
  filepath: string
): void {
  store.dispatch(actions.saveAs({ filepath, contentRef: ownProps.contentRef }));
}

const dialog = remote.dialog;

interface SaveDialogOptions {
  title: string;
  filters: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
}

export function showSaveAsDialog(): Promise<string> {
  return new Promise((resolve, _reject) => {
    const options: SaveDialogOptions = {
      title: "Save Notebook",
      filters: [{ name: "Notebooks", extensions: ["ipynb"] }]
    };

    // In Electron, we want an object we can merge into dialog opts, falling back
    // to the defaults from the dialog by not defining defaultPath. Electron treats
    // a literal undefined differently than this not being set.
    const defaultPath = getDocumentDirectory();
    if (process.cwd() !== defaultPath) {
      options.defaultPath = defaultPath;
    }

    dialog.showSaveDialog(options, filepath => {
      // If there was a filepath set and the extension name for it is blank,
      // append `.ipynb`
      resolve(
        filepath && path.extname(filepath) === ""
          ? `${filepath}.ipynb`
          : filepath
      );
    });
  });
}

export function triggerWindowRefresh(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  filepath: string
): void {
  if (!filepath) {
    return;
  }

  store.dispatch(actions.saveAs({ filepath, contentRef: ownProps.contentRef }));
}

export function dispatchRestartKernel(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  outputHandling: actions.RestartKernelOutputHandling
): void {
  const state = store.getState();
  const kernelRef = selectors.kernelRefByContentRef(state, ownProps);

  if (!kernelRef) {
    store.dispatch(actions.coreError(new Error("kernel not set")));
    return;
  }

  store.dispatch(
    actions.restartKernel({
      outputHandling,
      kernelRef,
      contentRef: ownProps.contentRef
    })
  );
}

export function promptUserAboutNewKernel(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  filepath: string
): Promise<void> {
  return new Promise(resolve => {
    dialog.showMessageBox(
      {
        type: "question",
        buttons: ["Launch New Kernel", "Don't Launch New Kernel"],
        title: "New Kernel Needs to Be Launched",
        message:
          "It looks like you've saved your notebook file to a new location.",
        detail:
          "The kernel executing your code thinks your notebook is still in " +
          "the old location. Would you like to launch a new kernel to match " +
          "it with the new location of the notebook?"
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
            : getDocumentDirectory();

          // Create a brand new kernel
          const kernelRef = createKernelRef();

          store.dispatch(
            actions.launchKernelByName({
              kernelSpecName: kernel.kernelSpecName,
              cwd,
              kernelRef,
              selectNextKernel: true,
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
  store: DesktopStore
): void {
  showSaveAsDialog().then(filepath => {
    if (filepath) {
      triggerWindowRefresh(ownProps, store, filepath);
      promptUserAboutNewKernel(ownProps, store, filepath);
    }
  });
}

export function dispatchSave(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  const state = store.getState();

  const filepath = selectors.filepath(state, ownProps);

  if (filepath === null || filepath === "") {
    triggerSaveAs(ownProps, store);
  } else {
    store.dispatch(actions.save(ownProps));
  }
}

export function dispatchNewKernel(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  _evt: Event,
  kernelSpec: KernelSpec
): void {
  const state = store.getState();
  const filepath = selectors.filepath(state, ownProps);
  const cwd =
    filepath !== null
      ? path.dirname(path.resolve(filepath))
      : getDocumentDirectory();

  // Create a brand new kernel
  const kernelRef = createKernelRef();

  store.dispatch(
    actions.launchKernel({
      kernelSpec,
      cwd,
      kernelRef,
      selectNextKernel: true,
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchPublishGist(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  _event: Event
): void {
  const state = store.getState();
  const githubToken = state.app.get("githubToken");

  // The simple case -- we have a token and can publish
  if (githubToken != null) {
    store.dispatch(actions.publishGist(ownProps));
    return;
  }

  // If the Github Token isn't set, use our oauth server to acquire a token
  store.dispatch(sendNotification.create({
    key: "github-publish",
    icon: "book",
    title: "Publishing Gist",
    message: "Authenticating...",
    level: "in-progress",
  }));

  // Because the remote object from Electron main <--> renderer can be
  // "cleaned up"
  const electronRemote = require("electron").remote;

  // Create our oauth window
  const win = new electronRemote.BrowserWindow({
    show: false,
    webPreferences: { zoomFactor: 0.75, nodeIntegration: true }
  });

  // TODO: This needs to be moved to an epic
  win.webContents.on("dom-ready", () => {
    // When we're at our callback code page, keep the page hidden
    if (win.webContents.getURL().indexOf("callback?code=") !== -1) {
      // Extract the text content
      win.webContents.executeJavaScript(
        "require('electron').ipcRenderer.send('auth', " +
          "document.body.textContent);"
      );
      electronRemote.ipcMain.on("auth", (_authEvent: Event, auth: string) => {
        try {
          const accessToken = JSON.parse(auth).access_token;
          store.dispatch(actions.setGithubToken(accessToken));
          store.dispatch(sendNotification.create({
            key: "github-publish",
            icon: "book",
            title: "Publishing Gist",
            message: "Authenticated 🔒",
            level: "in-progress",
          }));
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
  store: DesktopStore
): void {
  store.dispatch(actions.executeAllCellsBelow(ownProps));
}

export function dispatchRunAll(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(actions.executeAllCells(ownProps));
}

export function dispatchClearAll(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(actions.clearAllOutputs(ownProps));
}

export function dispatchUnhideAll(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
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
  store: DesktopStore
): void {
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
  store: DesktopStore
): void {
  const state = store.getState();

  if (process.platform === "win32") {
    store.dispatch(sendNotification.create({
      title: "Not supported in Windows",
      message: "Kernel interruption is not supported in Windows.",
      level: "error",
    }));
  } else {
    const kernelRef = selectors.kernelRefByContentRef(state, ownProps);
    if (!kernelRef) {
      store.dispatch(actions.coreError(new Error("kernel not set")));
      return;
    }

    store.dispatch(
      actions.interruptKernel({ kernelRef, contentRef: ownProps.contentRef })
    );
  }
}

export function dispatchZoomIn(): void {
  webFrame.setZoomLevel(webFrame.getZoomLevel() + 1);
}

export function dispatchZoomOut(): void {
  webFrame.setZoomLevel(webFrame.getZoomLevel() - 1);
}

export function dispatchZoomReset(): void {
  webFrame.setZoomLevel(0);
}

export function dispatchSetTheme(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  evt: Event,
  theme: string
): void {
  store.dispatch(setTheme(theme));
}

export function dispatchSetCursorBlink(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  evt: Event,
  value: string
): void {
  store.dispatch(setCursorBlink(value));
}

export function dispatchSetDefaultKernel(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  evt: Event,
  value: string
): void {
  store.dispatch(setDefaultKernel(value));
}

export function dispatchCopyCell(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(actions.copyCell({ contentRef: ownProps.contentRef }));
}

export function dispatchCutCell(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(actions.cutCell({ contentRef: ownProps.contentRef }));
}

export function dispatchPasteCell(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(actions.pasteCell(ownProps));
}

export function dispatchDeleteCell(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(actions.deleteCell({ contentRef: ownProps.contentRef }));
}

export function dispatchCreateCellAbove(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(
    actions.createCellAbove({
      cellType: "code",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchCreateCellBelow(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(
    actions.createCellBelow({
      cellType: "code",
      source: "",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchCreateTextCellBelow(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(
    actions.createCellBelow({
      cellType: "markdown",
      source: "",
      contentRef: ownProps.contentRef
    })
  );
}
export function dispatchCreateRawCellBelow(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(
    actions.createCellBelow({
      cellType: "raw",
      source: "",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchChangeCellToCode(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(
    actions.changeCellType({
      to: "code",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchChangeCellToText(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  store.dispatch(
    actions.changeCellType({
      to: "markdown",
      contentRef: ownProps.contentRef
    })
  );
}

export function dispatchLoad(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  event: Event,
  filepath: string
): void {
  // We are loading a new document so we will create a kernelRef
  const kernelRef = createKernelRef();

  // Remove the protocol string from requests originating from
  // another notebook
  filepath = filepath.replace("file://", "");

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
  store: DesktopStore,
  event: Event,
  filepath: string | null,
  kernelSpec: KernelSpec
): void {
  // It's a brand new notebook so we create a kernelRef for it
  const kernelRef = createKernelRef();

  store.dispatch(
    // if filepath is null
    // for desktop, we _can_ assume this has no path except for living in `cwd`
    // which I suppose _could_ be called `${cwd}/UntitledN.ipynb`
    // for jupyter extension, we _would_ call this `${cwd}/UntitledN.ipynb`

    actions.newNotebook({
      filepath,
      cwd: getDocumentDirectory(),
      kernelSpec,
      kernelRef,
      contentRef: ownProps.contentRef
    })
  );
}

/**
 * Print notebook to PDF.
 * It will expand all cell outputs before printing and restore cells it expanded
 * when complete.
 *
 * @param {object} ownProps - An object containing a contentRef
 * @param {object} store - The Redux store
 * @param {string} basepath - basepath of the PDF to be saved.
 */
export function exportPDF(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  basepath: string,
): void {
  const state = store.getState();

  const pdfPath = `${basepath}.pdf`;

  const model = selectors.model(state, ownProps);
  if (!model || model.type !== "notebook") {
    throw new Error(
      "Massive strangeness in the desktop app if someone is exporting a " +
        "non-notebook to PDF"
    );
  }

  const unexpandedCells = selectors.notebook.hiddenCellIds(model);
  // TODO: we should not be modifying the document to print PDFs
  //       and we especially shouldn't be relying on all these actions to
  //       run through before we print...
  // Expand unexpanded cells
  unexpandedCells.map((cellId: string) =>
    store.dispatch(
      actions.toggleOutputExpansion({
        id: cellId,
        contentRef: ownProps.contentRef
      })
    )
  );

  remote.getCurrentWindow().webContents.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error) {
        throw error;
      }

      // Restore the modified cells to their unexpanded state.
      unexpandedCells.map((cellId: string) =>
        store.dispatch(
          actions.toggleOutputExpansion({
            id: cellId,
            contentRef: ownProps.contentRef
          })
        )
      );

      fs.writeFile(pdfPath, data, _error_fs => {
        // Show the user the most important parts of the PDF path, as much as
        // they have space in the message.
        const pdfPathParts = pdfPath.split("/");
        const Spacer = styled.div`
          height: 30px;
        `;
        const NoWrap = styled.div`
          white-space: nowrap;
          position: absolute;
          width: 250px;
          
          * { 
            font-size: 14px !important;
            background: transparent !important;
          }
          
          li::after { margin: 0 3px !important; }
        `;

        store.dispatch(sendNotification.create({
          title: "PDF exported",
          message:
            <>
              <NoWrap>
                <Breadcrumbs items={pdfPathParts.map((each, i) => ({
                  text: each,
                  icon: i === pdfPathParts.length - 1
                    ? "document"
                    : "folder-close",
                  onClick: i === pdfPathParts.length - 1
                    ? () => shell.openItem(pdfPath)
                    : undefined,
                }))}/>
              </NoWrap>
              <Spacer/>
            </>,
          level: "success",
          action: {
            label: "Open",
            callback: () => shell.openItem(pdfPath),
          },
        }));
      });
    }
  );
}

export function triggerSaveAsPDF(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
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
  store: DesktopStore
): void {
  const state = store.getState();
  const notebookName = selectors.filepath(state, ownProps);
  if (notebookName === null) {
    store.dispatch(sendNotification.create({
      title: "File has not been saved!",
      message: `Click the button below to save the notebook so that it can be
       exported as a PDF.`,
      level: "warning",
      action: {
        label: "Save As",
        callback(): void {
          triggerSaveAsPDF(ownProps, store);
        }
      }
    }));
  } else {
    const basename = path.basename(notebookName, ".ipynb");
    const basepath = path.join(path.dirname(notebookName), basename);
    exportPDF(ownProps, store, basepath);
  }
}

export function dispatchLoadConfig(
  _ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  const HOME = remote.app.getPath("home");
  const CONFIG_FILE_PATH = path.join(HOME, ".jupyter", "nteract.json");

  store.dispatch(loadConfig.create(CONFIG_FILE_PATH));
}

export function initMenuHandlers(
  contentRef: ContentRef,
  store: DesktopStore
): void {
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
    "menu:new-raw-cell-below",
    dispatchCreateRawCellBelow.bind(null, opts, store)
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
  ipc.on(
    "menu:set-default-kernel",
    dispatchSetDefaultKernel.bind(null, opts, store)
  );
  ipc.on("menu:publish:gist", dispatchPublishGist.bind(null, opts, store));
  ipc.on("menu:exportPDF", storeToPDF.bind(null, opts, store));
  ipc.on("main:load", dispatchLoad.bind(null, opts, store));
  ipc.on("main:load-config", dispatchLoadConfig.bind(null, opts, store));

  /* Global non-content aware actions */
  ipc.on("menu:zoom-in", dispatchZoomIn);
  ipc.on("menu:zoom-out", dispatchZoomOut);
  ipc.on("menu:zoom-reset", dispatchZoomReset);
}
