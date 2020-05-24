import { actions, ContentRef, createKernelRef, KernelspecInfo, selectors } from "@nteract/core";
import { Event, ipcRenderer as ipc, remote } from "electron";
import { NewNotebook } from "../common/commands";
import { dispatchCommandInRenderer } from "../common/commands/dispatch";
import { ReqContent, ReqKernelSpec } from "../common/commands/types";
import { closeNotebook } from "./actions";
import { DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED, DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE } from "./state";
import { DesktopStore } from "./store";
import { clipboard } from "electron";
import * as plist from "plist";
import { insertImages } from "./insert-images";

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
  event: DragEvent,
  contentRef: ContentRef,
  store: DesktopStore
) {
  let imagePaths = ((event.dataTransfer) ? Array.from(event.dataTransfer.files) : [])
    .filter(file => file.type.match(/image.*/))
    .map(file => file.path);

  let copyImagesToNotebookDirectory: boolean = (event.dataTransfer?.effectAllowed == "copy");
  let linkImagesAndKeepAtOriginalPath: boolean = (event.dataTransfer?.effectAllowed == "link");
  let embedImagesInNotebook: boolean = !(copyImagesToNotebookDirectory || linkImagesAndKeepAtOriginalPath);

  insertImages({
    imagePaths: imagePaths,
    copyImagesToNotebookDirectory: copyImagesToNotebookDirectory,
    linkImagesAndKeepAtOriginalPath: linkImagesAndKeepAtOriginalPath,
    embedImagesInNotebook: embedImagesInNotebook,
    contentRef: contentRef,
    store: store
  });
}

export function onPaste(
  event: ClipboardEvent,
  contentRef: ContentRef,
  store: DesktopStore
) {
  // Paste image paths (macOS only).
  // https://github.com/nteract/nteract/issues/4963#issuecomment-627561034
  if (clipboard.has('NSFilenamesPboardType')) {
    let filePathsFromClipboard: Array<string> = plist.parse(clipboard.read('NSFilenamesPboardType'));
    let imagePaths = filePathsFromClipboard
      .filter(filePath => /[\w-]+\.(png|jpg|jpeg|heic|gif|tiff)/.test(filePath));

    insertImages({
      imagePaths: imagePaths,
      embedImagesInNotebook: true,
      contentRef: contentRef,
      store: store
    });

    event.preventDefault();

  // Paste blob image from the clipboard.
  } else if (clipboard.has('public.tiff')) {
    let base64ImageSource = clipboard.readImage().toDataURL();

    insertImages({
      base64ImageSource: base64ImageSource,
      embedImagesInNotebook: true,
      contentRef: contentRef,
      store: store
    });

    event.preventDefault();
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

  ipc.on(
    "main:load", (_event: Event, filepath: string) =>
      store.dispatch(
        actions.fetchContent({
          // Remove the protocol string from requests originating from
          // another notebook
          filepath: filepath.replace("file://", ""),
          params: {},
          kernelRef: createKernelRef(),
          contentRef,
        }),
      ),
  );

  ipc.on(
    "main:new", (
      _event: Event,
      filepath: string | null,
      kernelSpec: KernelspecInfo,
    ) =>
      dispatchCommandInRenderer(store, NewNotebook, {
        contentRef,
        kernelSpec,
        filepath: filepath ?? undefined,
      } as ReqContent & ReqKernelSpec),
  );

  // Listen to drag-and-drop events, e.g. to handle dropping images.
  window.addEventListener('drop', (event) => onDrop(event, contentRef, store));

  // Listen to paste evnet, e.g. to insert pasted image files.
  window.addEventListener('paste', (event) => onPaste(event, contentRef, store));
}
