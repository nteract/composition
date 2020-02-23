import { Breadcrumbs } from "@blueprintjs/core";
import { actions, selectors } from "@nteract/core";
import { sendNotification } from "@nteract/mythic-notifications";
import { ContentRef } from "@nteract/types";
import { remote, shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import React from "react";
import styled from "styled-components";
import { DesktopStore } from "../notebook/store";
import { showSaveAsDialog, triggerWindowRefresh } from "./menu-save";

/**
 * Print notebook to PDF.
 * It will expand all cell outputs before printing and restore cells it expanded
 * when complete.
 *
 * @param {object} ownProps - An object containing a contentRef
 * @param {object} store - The Redux store
 * @param {string} basepath - basepath of the PDF to be saved.
 */
export function exportPDF(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  basepath: string
): void {
  const state = store.getState();

  const pdfPath = `${basepath}.pdf`;

  const model = selectors.model(state, ownProps);
  if (!model || model.type !== "notebook") {
    throw new Error(
      "Massive strangeness in the desktop app if someone is exporting a " +
      "non-notebook to PDF"
    );
  }

  const unexpandedCells = selectors.notebook.hiddenCellIds(model);
  // TODO: we should not be modifying the document to print PDFs
  //       and we especially shouldn't be relying on all these actions to
  //       run through before we print...
  // Expand unexpanded cells
  unexpandedCells.map((cellId: string) =>
    store.dispatch(
      actions.toggleOutputExpansion({
        id: cellId,
        contentRef: ownProps.contentRef
      })
    )
  );

  remote.getCurrentWindow().webContents.printToPDF(
    {
      printBackground: true
    },
    (error, data) => {
      if (error) {
        throw error;
      }

      // Restore the modified cells to their unexpanded state.
      unexpandedCells.map((cellId: string) =>
        store.dispatch(
          actions.toggleOutputExpansion({
            id: cellId,
            contentRef: ownProps.contentRef
          })
        )
      );

      fs.writeFile(pdfPath, data, _error_fs => {
        // Show the user the most important parts of the PDF path, as much as
        // they have space in the message.
        const pdfPathParts = pdfPath.split("/");
        const Spacer = styled.div`
          height: 30px;
        `;
        const NoWrap = styled.div`
          white-space: nowrap;
          position: absolute;
          width: 250px;
          
          * { 
            font-size: 14px !important;
            background: transparent !important;
          }
          
          li::after { margin: 0 3px !important; }
        `;

        store.dispatch(sendNotification.create({
          title: "PDF exported",
          message:
            <>
              <NoWrap>
                <Breadcrumbs items={pdfPathParts.map((each, i) => ({
                  text: each,
                  icon: i === pdfPathParts.length - 1
                    ? "document"
                    : "folder-close",
                  onClick: i === pdfPathParts.length - 1
                    ? () => shell.openItem(pdfPath)
                    : undefined
                }))}/>
              </NoWrap>
              <Spacer/>
            </>,
          level: "success",
          action: {
            label: "Open",
            callback: () => shell.openItem(pdfPath)
          }
        }));
      });
    }
  );
}

export function triggerSaveAsPDF(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  showSaveAsDialog()
    .then((filepath?: string | null) => {
      if (filepath) {
        return Promise.all([
          triggerWindowRefresh(ownProps, store, filepath)
        ]).then(() => storeToPDF(ownProps, store));
      }
    })
    .catch(e => store.dispatch(actions.coreError(e)));
}

export function storeToPDF(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore
): void {
  const state = store.getState();
  const notebookName = selectors.filepath(state, ownProps);
  if (notebookName === null) {
    store.dispatch(sendNotification.create({
      title: "File has not been saved!",
      message: `Click the button below to save the notebook so that it can be
       exported as a PDF.`,
      level: "warning",
      action: {
        label: "Save As",
        callback(): void {
          triggerSaveAsPDF(ownProps, store);
        }
      }
    }));
  } else {
    const basename = path.basename(notebookName, ".ipynb");
    const basepath = path.join(path.dirname(notebookName), basename);
    exportPDF(ownProps, store, basepath);
  }
}