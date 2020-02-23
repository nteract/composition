import { actions } from "@nteract/core";
import { ipcRenderer as ipc } from "electron";
import throttle from "lodash.throttle";
import { storeToPDF } from "../menu-export-pdf";
import { dispatchPublishGist } from "../menu-publish-gist";
import { getCurrentDocumentDirectory, getDocumentDirectory, triggerSaveAs } from "../menu-save";

export const NewNotebook = {
  makeAction: () =>
    actions.newNotebook.with({
      cwd: getDocumentDirectory(),
      kernelRef: createKernelRef(),
    }),
};

export const NewKernel = {
  makeAction: () =>
    actions.launchKernel.with({
      cwd: getCurrentDocumentDirectory(store, contentRef),
      kernelRef: createKernelRef(),
      selectNextKernel: true,
    }),
};

export const RunAll = {
  action: actions.executeAllCells,
};

export const RunAllBelow = {
  action: actions.executeAllCellsBelow,
};

export const ClearAll = {
  action: actions.clearAllOutputs,
};

export const UnhideAll = {
  action: actions.unhideAll.with({ inputHidden: false, outputHidden: false }),
};

export const CopyCell = {
  action: actions.copyCell,
};

export const CutCell = {
  action: actions.cutCell,
};

  "paste-cell": () =>
  actions.pasteCell,

  "delete-cell": () =>
  actions.deleteCell,

  "new-code-cell-above": () =>
  actions.createCellAbove.with({ cellType: "code" }),

  "new-code-cell-below": () =>
  actions.createCellBelow.with({ cellType: "code", source: "" }),

  "new-text-cell-below": () =>
  actions.createCellBelow.with({ cellType: "markdown", source: "" }),

  "new-raw-cell-below": () =>
  actions.createCellBelow.with({ cellType: "raw", source: "" }),

  "change-cell-to-code": () =>
  actions.changeCellType.with({ to: "code" }),

  "change-cell-to-text": () =>
  actions.changeCellType.with({ to: "markdown" }),

  "save": () => throttle(
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

  "save-as": (filepath: string) =>
  actions.saveAs.with({ filepath }),

  "kill-kernel": () =>
  actions.killKernel.with({ restarting: false }),

  "interrupt-kernel": () =>
  actions.interruptKernel,

  "restart-kernel": () =>
  actions.restartKernel.with({ outputHandling: "None" }),

  "restart-and-clear-all": () =>
  actions.restartKernel.with({ outputHandling: "Clear All" }),

  "restart-and-run-all": () =>
  actions.restartKernel.with({ outputHandling: "Run All" }),

  "load": (filepath: string) =>
  actions.fetchContent.with({
    // Remove the protocol string from requests originating from
    // another notebook
    filepath: filepath.replace("file://", ""),
    params: {},
    kernelRef: createKernelRef(),
  }),

  ipc.on(
    "publish:gist",
    dispatchPublishGist.bind(null, { contentRef }, store),
  );

ipc.on(
  "export:pdf",
  storeToPDF.bind(null, { contentRef }, store),
);
