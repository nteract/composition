import { Action } from "@nteract/actions";
import { actions, ContentRef, createKernelRef, selectors } from "@nteract/core";
import { setConfigFile } from "@nteract/mythic-configuration";
import { ipcRenderer as ipc, remote, webFrame } from "electron";
import throttle from "lodash.throttle";
import * as path from "path";
import { storeToPDF } from "./menu-export-pdf";
import { dispatchPublishGist } from "./menu-publish-gist";
import { getCurrentDocumentDirectory, getDocumentDirectory, triggerSaveAs } from "./menu-save";
import { DesktopStore } from "./store";

type KernelSpec = any;

const makeIpcCallbacks = (
  store: DesktopStore,
  contentRef: ContentRef,
  callbacks: Record<
    string,
    (...params: any[]) =>
      (props: { contentRef: string }) =>
        Action<string, any> | void
  >,
) => {
  Object.keys(callbacks).forEach(
    key =>
      ipc.on(
        key,
        <U extends Array<{}>>(event: Event, ...params: U) => {
          const action = callbacks[key](...params)({ contentRef });

          if (action !== undefined) {
            store.dispatch(action);
          }
        },
      )
  );
};

export function initMenuHandlers(
  contentRef: ContentRef,
  store: DesktopStore
): void {
  makeIpcCallbacks(
    store,
    contentRef,
    {
      "main:new": (filepath: string | null, kernelSpec: KernelSpec) =>
        actions.newNotebook.with({
          filepath,
          kernelSpec,
          cwd: getDocumentDirectory(),
          kernelRef: createKernelRef(),
        }),

      "menu:new-kernel": (kernelSpec: KernelSpec) =>
        actions.launchKernel.with({
          kernelSpec,
          cwd: getCurrentDocumentDirectory(store, contentRef),
          kernelRef: createKernelRef(),
          selectNextKernel: true,
        }),

      "menu:run-all": () =>
        actions.executeAllCells,

      "menu:run-all-below": () =>
        actions.executeAllCellsBelow,

      "menu:clear-all": () =>
        actions.clearAllOutputs,

      "menu:unhide-all": () =>
        actions.unhideAll.with({ inputHidden: false, outputHidden: false }),

      "menu:copy-cell": () =>
        actions.copyCell,

      "menu:cut-cell": () =>
        actions.cutCell,

      "menu:paste-cell": () =>
        actions.pasteCell,

      "menu:delete-cell": () =>
        actions.deleteCell,

      "menu:new-code-cell-above": () =>
        actions.createCellAbove.with({ cellType: "code" }),

      "menu:new-code-cell-below": () =>
        actions.createCellBelow.with({ cellType: "code", source: "" }),

      "menu:new-text-cell-below": () =>
        actions.createCellBelow.with({ cellType: "markdown", source: "" }),

      "menu:new-raw-cell-below": () =>
        actions.createCellBelow.with({ cellType: "raw", source: "" }),

      "menu:change-cell-to-code": () =>
        actions.changeCellType.with({ to: "code" }),

      "menu:change-cell-to-text": () =>
        actions.changeCellType.with({ to: "markdown" }),

      "menu:save": () => throttle(
        (props) => {
          const filepath = selectors.filepath(store.getState(), props);
          if (filepath === null || filepath === "") {
            triggerSaveAs(props, store);
          } else {
            return actions.save(props);
          }
        },
        2000,
      ),

      "menu:save-as": (filepath: string) =>
        actions.saveAs.with({ filepath }),

      "menu:kill-kernel": () =>
        actions.killKernel.with({ restarting: false }),

      "menu:interrupt-kernel": () =>
        actions.interruptKernel,

      "menu:restart-kernel": () =>
        actions.restartKernel.with({ outputHandling: "None" }),

      "menu:restart-and-clear-all": () =>
        actions.restartKernel.with({ outputHandling: "Clear All" }),

      "menu:restart-and-run-all": () =>
        actions.restartKernel.with({ outputHandling: "Run All" }),

      "main:load": (filepath: string) =>
        actions.fetchContent.with({
          // Remove the protocol string from requests originating from
          // another notebook
          filepath: filepath.replace("file://", ""),
          params: {},
          kernelRef: createKernelRef(),
        }),

      "main:load-config": () => ({ contentRef: _unused }) =>
        setConfigFile(path.join(
          remote.app.getPath("home"), ".jupyter", "nteract.json",
        )),

      "menu:zoom-in": () => ({ contentRef: _unused }) =>
        webFrame.setZoomLevel(webFrame.getZoomLevel() + 1),

      "menu:zoom-out": () => ({ contentRef: _unused }) =>
        webFrame.setZoomLevel(webFrame.getZoomLevel() - 1),

      "menu:zoom-reset": () => ({ contentRef: _unused }) =>
        webFrame.setZoomLevel(0),
    },
  );

  ipc.on(
    "menu:publish:gist",
    dispatchPublishGist.bind(null, { contentRef }, store),
  );

  ipc.on(
    "menu:exportPDF",
    storeToPDF.bind(null, { contentRef }, store),
  );
}
