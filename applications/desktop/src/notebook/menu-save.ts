import { actions, createKernelRef, selectors } from "@nteract/core";
import { ContentRef } from "@nteract/types";
import { remote } from "electron";
import * as fs from "fs";
import * as path from "path";
import { DesktopStore } from "./store";

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

export function getCurrentDocumentDirectory(store: DesktopStore, contentRef: ContentRef): string {
  const filepath = selectors.filepath(store.getState(), { contentRef });
  return filepath !== null
    ? path.dirname(path.resolve(filepath))
    : getDocumentDirectory();
}

export function getDocumentDirectory(): string {
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

function isWriteable(pathToCheck: string): boolean {
  try {
    fs.accessSync(pathToCheck, fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}