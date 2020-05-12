import { selectors } from "@nteract/core";
import { ContentRef } from "@nteract/core";
import { ipcRenderer as ipc } from "electron";
import { Store } from "redux";

import { insertImages } from "./insert-images";

import { Actions, closeNotebook } from "./actions";
import { DesktopNotebookAppState } from "./state";
import {
  DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED,
  DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
} from "./state";

import { DesktopStore } from "./store";

export function onBeforeUnloadOrReload(
  contentRef: ContentRef,
  store: DesktopStore,
  reloading: boolean
) {
  const state = store.getState();
  const model = selectors.model(state, { contentRef });

  if (!model || model.type !== "notebook") {
    // No model on the page, don't block them
    return;
  }

  const closingState = state.desktopNotebook.closingState;
  if (closingState === DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED) {
    // Dispatch asynchronously since returning ASAP is imperative for canceling close/unload.
    // See https://github.com/electron/electron/issues/12668
    setTimeout(
      () => store.dispatch(closeNotebook({ contentRef, reloading })),
      0
    );
  }

  if (closingState !== DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE) {
    return false;
  }
}

export function onDrop(
  event: MouseEvent,
  contentRef: ContentRef,
  store: DesktopStore
) {
  let imagePaths = Array.from(event.dataTransfer.files)
    .filter(file => file.type.match(/image.*/))
    .map(file => file.path);

  // If the options/alt key (macOS) or the ctrl key (linux, windows)
  // is held down while dropping the image,
  // the images are copied to the notebook directory and linked
  // via a relative path.
  // If no key is held down while dropping the image,
  // the images are not copied, but their original file paths
  // are used.
  let copyImagesToNotebookDirectory =
    (event.altKey || event.ctrlKey);

  insertImages({
    imagePaths: imagePaths,
    copyImagesToNotebookDirectory: copyImagesToNotebookDirectory,
    contentRef: contentRef,
    store: store
  });
}

export function initGlobalHandlers(
  contentRef: ContentRef,
  store: DesktopStore
) {
  // This wiring of onBeforeUnloadOrReload is meant to handle:
  // - User closing window by hand
  // - Programmatic close from main process such as during a quit
  window.onbeforeunload = onBeforeUnloadOrReload.bind(
    null,
    contentRef,
    store,
    false
  );

  // This is our manually orchestrated reload. Tried using onclose vs. onbeforeunload
  // to distinguish between the close and reload cases, but onclose doesn't fire
  // reliably when wired from inside the renderer.
  // In our manually-orchestrated reload, onbeforeunload will still fire
  // at the end, but by then we'd transitioned our closingState such that it's a no-op.
  ipc.on("reload", () => onBeforeUnloadOrReload(contentRef, store, true));

  // Listen to drag-and-drop events, e.g. to handle dropping images.
  window.addEventListener('drop', (event) => onDrop(event, contentRef, store));
}
