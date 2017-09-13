/* @flow */

import type { Store } from "redux";
import type { AppState } from "./records";

import { forceShutdownKernel } from "./kernel/shutdown";

export function unload(store: Store<AppState, Action>) {
  const state = store.getState();
  const kernel = {
    channels: state.app.channels,
    spawn: state.app.spawn,
    connectionFile: state.app.connectionFile
  };
  forceShutdownKernel(kernel);
}

import { save } from "./actions";

import { remote } from "electron";
const dialog = remote.dialog;

// HACK: module level global
// this function should emit two actions:
// * SAVE_AND_QUIT
// * JUST_QUIT_ALREADY
let totallyExit = false;
export function beforeUnload(store: Store<AppState, Action>, e: any) {
  if (totallyExit) {
    return;
  }
  e.preventDefault();
  e.returnValue = false;

  const win = remote.getCurrentWindow();

  dialog.showMessageBox(
    win,
    {
      type: "question",
      buttons: ["Save", "Don't Save"],
      defaultId: 0,
      title: "Save Notebook",
      message: "Save notebook before closing?",
      detail: "Would you like to save this notebook before closing?"
    },
    index => {
      if (index === 0) {
        const state = store.getState();
        const notebook = state.document.get("notebook");
        // TODO if this is a totally unsaved notebook, we won't have a filename
        //      and would have to do the save as mechanics as we have in ./menu here
        const filename = state.metadata.get("filename");

        store.dispatch(save(filename, notebook));
        // TODO Wait for save
        // TODO Wait for kernels to close
        // TODO Actually close
        totallyExit = true;
      } else {
        win.close();
        totallyExit = true;
      }
    }
  );
}

export function initGlobalHandlers(store: Store<AppState, Action>) {
  console.log("registered global handlers");
  global.window.onbeforeunload = beforeUnload.bind(null, store);
  global.window.onunload = unload.bind(null, store);
}
