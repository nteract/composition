import { actions } from "@nteract/core";
import { selectors } from "@nteract/core";
import { ContentRef } from "@nteract/core";
import { ipcRenderer as ipc } from "electron";
import { Store } from "redux";
import * as path from "path";
import * as fs from 'fs';

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
  var imagePaths = Array.from(event.dataTransfer.files)
    .filter(file => file.type.match(/image.*/))
    .map(file => file.path);

  const notebookPath = path.dirname(selectors.filepath(store.getState(), {contentRef: contentRef}));

  // When holding the alt key, copy the files to the notebook directory.
  if (event.altKey) {
    let destinationImagePaths = []
    for (let sourceImagePath of imagePaths) {
      let imageBaseName = path.basename(sourceImagePath);
      let destinationImagePath = `${notebookPath}/${imageBaseName}`;
      destinationImagePaths.push(destinationImagePath);
      if (! fs.existsSync(destinationImagePath)) {
        fs.copyFile(sourceImagePath, destinationImagePath, () => {});
      } else {
        // TODO: Can we have some kind of warning banner here?
      }
    }
    imagePaths = destinationImagePaths;
  };

  // For image files that are within the notebook directory, only use relative paths,
  // for all other files, use the full path.
  imagePaths = imagePaths.map(imagePath => {
    let relativePath = path.relative(notebookPath, imagePath);
    if (relativePath.startsWith("../")) {
      return imagePath;
    } else {
      return relativePath;
    }
  });

  if (imagePaths.length > 0) {
    store.dispatch(
      actions.createCellBelow({ // FIXME: I would like to insert the cell above, but `createCellBelow` appears to ignore the `source` argument.
        cellType: "markdown",
        contentRef: contentRef,
        source: imagePaths.map((path) => `<img src=\"${path}\">`).join("\n")
      })
    );
  }
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
