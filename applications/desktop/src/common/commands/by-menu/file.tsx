import { actions, createKernelRef, selectors } from "@nteract/core";
import { sendNotification } from "@nteract/mythic-notifications";
import { app, dialog, remote, shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import React from "react";
import { promisify } from "util";
import { launch } from "../../../main/launch";
import { DesktopCommand, dispatchCommand, RequiresContent, RequiresKernelSpec } from "../types";
import { authenticate } from "../utils/auth";
import { showSaveAsDialog } from "../utils/dialogs";
import { systemDocumentDirectory } from "../utils/directories";
import { FilePathMessage } from "../utils/notifications";

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

export const Open: DesktopCommand = {
  name: "Open",
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

export const ClearRecentDocuments = {
  name: "ClearRecentDocuments",
  mapToElectronRole: "clearRecentDocuments",
};

export const SaveAs: DesktopCommand<RequiresContent> = {
  name: "SaveAs",
  async *makeActionTemplates() {
    const newFilepath = await showSaveAsDialog();

    if (newFilepath) {
      yield actions.saveAs.with({ filepath: newFilepath });
    }
  },
};

export const Save: DesktopCommand<RequiresContent> = {
  name: "Save",
  async *makeActionTemplates(store, props) {
    const filepath = selectors.filepath(store.getState(), props);

    if (filepath === null || filepath === "") {
      yield* SaveAs.makeActionTemplates(store, props);
    } else {
      yield actions.save;
    }
  },
};

export const PublishGist: DesktopCommand<RequiresContent> = {
  name: "PublishGist",
  async *makeActionTemplates(store) {
    const makeGithubNotification = (message: string) =>
      sendNotification.with({
        level: "in-progress",
        key: "github-publish",
        icon: "book",
        title: "Publishing Gist",
        message,
      });

    if (!store.getState().app.get("githubToken")) {
      yield makeGithubNotification("Authenticating...");

      yield actions.setGithubToken.with({
        githubToken: await authenticate("github"),
      });

      yield makeGithubNotification("Authenticated 🔒");
    }

    yield actions.publishGist;
  },
};

export const ExportPDF: DesktopCommand<RequiresContent> = {
  name: "ExportPDF",
  async *makeActionTemplates(store, props) {
    const state = store.getState();
    const notebookName = selectors.filepath(state, props);

    if (notebookName === null) {
      yield sendNotification.with({
        title: "File has not been saved!",
        message: `Click the button below to save the notebook so that it can be
                  exported as a PDF.`,
        level: "warning",
        action: {
          label: "Save As & Export PDF",
          callback: () => {
            dispatchCommand(store, SaveAs, props);
            dispatchCommand(store, ExportPDF, props);
          },
        },
      });
      return;
    }

    const basename = path.basename(notebookName, ".ipynb");
    const basepath = path.join(path.dirname(notebookName), basename);
    const pdfPath = `${basepath}.pdf`;
    const model = selectors.notebookModel(state, props);

    // TODO: we should not be modifying the document to print PDFs
    //       and we especially shouldn't be relying on all these actions to
    //       run through before we print...
    const unexpandedCells = selectors.notebook.hiddenCellIds(model);
    yield* unexpandedCells.map(
      id => actions.toggleOutputExpansion.with({ id }),
    );

    let data: any;

    try {
      data = await promisify(remote.getCurrentWindow().webContents.printToPDF)(
        { printBackground: true },
      );
    }
    finally {
      // Restore the modified cells to their unexpanded state.
      yield* unexpandedCells.map(
        id => actions.toggleOutputExpansion.with({ id }),
      );
    }

    await promisify(fs.writeFile)(pdfPath, data);

    yield sendNotification.with({
      title: "PDF exported",
      message: <FilePathMessage filepath={pdfPath}/>,
      level: "success",
      action: {
        label: "Open",
        callback: () => shell.openItem(pdfPath),
      },
    });
  },
};
