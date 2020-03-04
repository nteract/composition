import { actions, ContentRef, createKernelRef, KernelspecInfo, selectors } from "@nteract/core";
import { app, dialog } from "electron";
import { Action, Store } from "redux";
import { launch } from "../../main/launch";
import { DesktopStore } from "../../notebook/store";
import { currentDocumentDirectory, systemDocumentDirectory } from "../directories";
import { showSaveAsDialog } from "../menu-save";

export type ActionTemplate<PROPS> =
  | ((props: PROPS) => Action | Promise<Action | undefined>)
  | ((props: {})    => Action | Promise<Action | undefined>)
  ;

export type ActionTemplateGenerator<PROPS> =
  | Generator<ActionTemplate<PROPS>>
  | AsyncGenerator<ActionTemplate<PROPS>>
  ;

export interface Command<STORE extends Store, PROPS> {
  name: string;
  makeActionTemplates: (store: STORE, props: PROPS) =>
    ActionTemplateGenerator<PROPS>;
}

export interface RequiresContent { contentRef: ContentRef }
export interface RequiresKernelSpec { kernelSpec: KernelspecInfo }

export type DesktopCommand<PROPS = {}> = Command<DesktopStore, PROPS>;

export const dispatchCommand = <
  STORE extends Store,
  COMMAND extends Command<STORE, PROPS>,
  PROPS
  >(
  store: STORE,
  command: COMMAND,
  props: PROPS,
) => {
  const templates = command.makeActionTemplates(store, props);
  Promise.resolve(templates).then(
    async result => {
      for await (const template of result) {
        const action = await template(props);
        if (action !== undefined) {
          store.dispatch(action);
        }
      }
    },
  );
};

export const NewNotebook:
  DesktopCommand<RequiresContent & RequiresKernelSpec> = {
  name: "NewNotebook",
  *makeActionTemplates() {
    yield actions.newNotebook.with({
      cwd: systemDocumentDirectory(),
      kernelRef: createKernelRef(),
      filepath: null,
    });
  },
};

export const NewKernel: DesktopCommand<RequiresContent & RequiresKernelSpec> = {
  *makeActionTemplates(store, { contentRef }) {
    yield actions.launchKernel.with({
      cwd: currentDocumentDirectory(store, contentRef),
      kernelRef: createKernelRef(),
      selectNextKernel: true,
    });
  },
};

export const RunAll: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.executeAllCells;
  },
};

export const RunAllBelow: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.executeAllCellsBelow;
  },
};

export const ClearAll: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.clearAllOutputs;
  },
};

export const UnhideAll: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.unhideAll.with({ inputHidden: false, outputHidden: false });
  },
};

export const CopyCell: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.copyCell;
  },
};

export const CutCell: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.cutCell;
  },
};

export const PasteCell: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.pasteCell;
  },
};

export const DeleteCell: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.deleteCell;
  },
};

export const NewCodeCellAbove: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.createCellAbove.with({ cellType: "code" });
  },
};

export const NewCodeCellBelow: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.createCellBelow.with({ cellType: "code", source: "" });
  },
};

export const NewTextCellBelow: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.createCellBelow.with({ cellType: "markdown", source: "" });
  },
};

export const NewRawCellBelow: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.createCellBelow.with({ cellType: "raw", source: "" });
  },
};

export const ChangeCellToCode: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.changeCellType.with({ to: "code" });
  },
};

export const ChangeCellToText: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.changeCellType.with({ to: "markdown" });
  },
};

export const SaveAs: DesktopCommand<RequiresContent> = {
  async *makeActionTemplates() {
    const newFilepath = await showSaveAsDialog();

    if (newFilepath) {
      yield actions.saveAs.with({ filepath: newFilepath });
    }
  },
};

export const Save: DesktopCommand<RequiresContent> = {
  async *makeActionTemplates(store, props) {
    const filepath = selectors.filepath(store.getState(), props);

    if (filepath === null || filepath === "") {
      yield* SaveAs.makeActionTemplates(store, props);
    } else {
      yield actions.save;
    }
  },
};

export const KillKernel: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.killKernel.with({ restarting: false });
  },
};

export const InterruptKernel: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.interruptKernel;
  },
};

export const RestartKernel: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.restartKernel.with({ outputHandling: "None" });
  },
};

export const RestartAndClearAll: DesktopCommand<RequiresContent> = {
  name: "RestartAndClearAll",
  *makeActionTemplates() {
    yield actions.restartKernel.with({ outputHandling: "Clear All" });
  },
};

export const RestartAsRunAll: DesktopCommand<RequiresContent> = {
  *makeActionTemplates() {
    yield actions.restartKernel.with({ outputHandling: "Run All" });
  },
};

export const Open: DesktopCommand = {
  *makeActionTemplates() {
    dialog.showOpenDialog({
      title: "Open a notebook",
      filters: [{ name: "Notebooks", extensions: ["ipynb"] }],
      properties: ["openFile"],
      defaultPath: process.cwd() === "/"
        ? app.getPath("home")
        : undefined,
    }, (fname?: string[]) => {
      if (fname) {
        launch(fname[0]);
        app.addRecentDocument(fname[0]);
      }
    });
  },
};
