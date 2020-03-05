import { Breadcrumbs } from "@blueprintjs/core";
import { actions, selectors } from "@nteract/core";
import { sendNotification } from "@nteract/mythic-notifications";
import { remote, shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import React from "react";
import styled from "styled-components";
import { promisify } from "util";
import { DesktopCommand, dispatchCommand, RequiresContent, SaveAs } from "./contents";

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
// Show the user the most important parts of the PDF path, as much as
// they have space in the message.
const PDFMessage = (props: { pdfPath: string }) =>
  <>
    <NoWrap>
      <Breadcrumbs items={props.pdfPath.split("/").map((each, i) => ({
        text: each,
        icon: i === props.pdfPath.split("/").length - 1
          ? "document"
          : "folder-close",
        onClick: i === props.pdfPath.split("/").length - 1
          ? () => shell.openItem(props.pdfPath)
          : undefined
      }))}/>
    </NoWrap>
    <Spacer/>
  </>;

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
      message: <PDFMessage pdfPath={pdfPath}/>,
      level: "success",
      action: {
        label: "Open",
        callback: () => shell.openItem(pdfPath),
      },
    });
  },
};
