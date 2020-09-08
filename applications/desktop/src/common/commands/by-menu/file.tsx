import { actions, createKernelRef, selectors } from "@nteract/core";
import { sendNotification } from "@nteract/mythic-notifications";
import { app, dialog, remote, shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import React from "react";
import { promisify } from "util";
import { launch, launchNewNotebook } from "../../../main/launch";
import { dispatchCommandInRenderer } from "../dispatch";
import { DesktopCommand, ElectronRoleCommand, ReqContent, ReqKernelSpec } from "../types";
import { authenticate } from "../utils/auth";
import { showSaveAsDialog } from "../utils/dialogs";
import { systemDocumentDirectory } from "../utils/directories";
import { FilePathMessage } from "../utils/notifications";

export const Launch: DesktopCommand<{ filepath: string }> = {
  name: "Launch",
  props: {
    filepath: "required",
  },
  runInMainThread({ filepath }) {
    launch(filepath);
  },
};

export const LaunchNewNotebook: DesktopCommand<
  ReqKernelSpec & { filepath?: string }
> = {
  name: "LaunchNewNotebook",
  props: {
    kernelSpec: "required",
    filepath: "optional",
  },
  runInMainThread({ kernelSpec, filepath }) {
    launchNewNotebook(filepath ?? null, kernelSpec);
  },
};

export const NewNotebook: DesktopCommand<
  ReqContent & ReqKernelSpec & { filepath?: string }
> = {
  name: "NewNotebook",
  props: {
    contentRef: "required",
    kernelSpec: "required",
    filepath: "optional",
  },
  *makeActions(_store, { contentRef, kernelSpec, filepath }) {
    yield actions.newNotebook({
      cwd: systemDocumentDirectory(),
      kernelRef: createKernelRef(),
      filepath: filepath ?? null,
      contentRef,
      kernelSpec,
    });
  },
};

export const Open: DesktopCommand = {
  name: "Open",
  props: {},
  runInMainThread() {
    dialog.showOpenDialog({
      title: "Open a notebook",
      filters: [{ name: "Notebooks", extensions: ["ipynb"] }],
      properties: ["openFile"],
      defaultPath: process.cwd() === "/"
        ? app.getPath("home")
        : undefined,
    }).then(({ filePaths: fname }) => {
      if (fname) {
        launch(fname[0]);
        app.addRecentDocument(fname[0]);
      }
    });
  },
};

export const ClearRecentDocuments: ElectronRoleCommand = {
  name: "ClearRecentDocuments",
  mapToElectronRole: "clearrecentdocuments" as any,
                      // Listed in electron docs, but not types
};

export const SaveAs: DesktopCommand<ReqContent> = {
  name: "SaveAs",
  props: {
    contentRef: "required",
  },
  async *makeActions(_store, props) {
    const newFilepath = await showSaveAsDialog();

    if (newFilepath) {
      yield actions.saveAs({ filepath: newFilepath, ...props });
    }
  },
};

export const Save: DesktopCommand<ReqContent> = {
  name: "Save",
  props: {
    contentRef: "required",
  },
  async *makeActions(store, props) {
    const filepath = selectors.filepath(store.getState(), props);

    if (filepath === null || filepath === "") {
      yield* SaveAs.makeActions!(store, props);
    } else {
      yield actions.save(props);
    }
  },
};

export const PublishGist: DesktopCommand<ReqContent> = {
  name: "PublishGist",
  props: {
    contentRef: "required",
  },
  async *makeActions(store, props) {
    const makeGithubNotification = (message: string) =>
      sendNotification.create({
        level: "in-progress",
        key: "github-publish",
        icon: "book",
        title: "Publishing Gist",
        message,
      });

    if (!store.getState().app.get("githubToken")) {
      yield makeGithubNotification("Authenticating...");
      yield actions.setGithubToken({
        githubToken: await authenticate("github"),
      });
      yield makeGithubNotification("Authenticated 🔒");
    }

    yield actions.publishGist(props);
  },
};

export const ExportPDF: DesktopCommand<ReqContent> = {
  name: "ExportPDF",
  props: {
    contentRef: "required",
  },
  async *makeActions(store, props) {
    const state = store.getState();
    const notebookName = selectors.filepath(state, props);

    if (notebookName === null) {
      yield sendNotification.create({
        title: "File has not been saved!",
        message: `Click the button below to save the notebook so that it can be
                  exported as a PDF.`,
        level: "warning",
        action: {
          label: "Save As & Export PDF",
          callback: () => {
            dispatchCommandInRenderer(store, SaveAs, props);
            dispatchCommandInRenderer(store, ExportPDF, props);
          },
        },
      });
      return;
    }

    const basename = path.basename(notebookName, ".ipynb");
    const basepath = path.join(path.dirname(notebookName), basename);
    const pdfPath = `${basepath}.pdf`;
    const model = selectors.notebookModel(state, props);

    let data: any;
    data = await remote.getCurrentWindow().webContents.printToPDF({printBackground: true},);

    await fs.writeFile(pdfPath, data, _erros_fs => {
      /**RID:JK TODO: use more user-facing error message? What?*/
      console.log('PDF export write failed');

    });
    yield sendNotification.create({
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
