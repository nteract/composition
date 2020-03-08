import { actions, createKernelRef, KernelspecInfo, selectors } from "@nteract/core";
import { ContentRef } from "@nteract/core";
import { setConfigFile } from "@nteract/mythic-configuration";
import { ipcRenderer as ipc, remote } from "electron";
import * as path from "path";
import { Store } from "redux";
import { NewNotebook } from "../common/commands";
import { dispatchCommand } from "../common/commands/dispatch";
import { OptFilepath, ReqContent, ReqKernelSpec } from "../common/commands/types";

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
      dispatchCommand(store, NewNotebook, {
        contentRef,
        kernelSpec,
        filepath: filepath ?? undefined,
      } as ReqContent & ReqKernelSpec & OptFilepath),
  );

  ipc.on(
    "main:load-config", (_event: Event) =>
      store.dispatch(
        setConfigFile(path.join(
          remote.app.getPath("home"), ".jupyter", "nteract.json",
        )),
      ),
  );
}
