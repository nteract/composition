import { actions } from "@nteract/core";
import { DesktopCommand, RequiresContent } from "../types";

export const Cut = {
  name: "Cut",
  mapToElectronRole: "cut",
};

export const Copy = {
  name: "Copy",
  mapToElectronRole: "copy",
};

export const Paste = {
  name: "Paste",
  mapToElectronRole: "paste",
};

export const SelectAll = {
  name: "SelectAll",
  mapToElectronRole: "selectAll",
};

export const CopyCell: DesktopCommand<RequiresContent> = {
  name: "CopyCell",
  *makeActionTemplates() {
    yield actions.copyCell;
  },
};

export const CutCell: DesktopCommand<RequiresContent> = {
  name: "CutCell",
  *makeActionTemplates() {
    yield actions.cutCell;
  },
};

export const PasteCell: DesktopCommand<RequiresContent> = {
  name: "PasteCell",
  *makeActionTemplates() {
    yield actions.pasteCell;
  },
};

export const DeleteCell: DesktopCommand<RequiresContent> = {
  name: "DeleteCell",
  *makeActionTemplates() {
    yield actions.deleteCell;
  },
};

export const NewCodeCellAbove: DesktopCommand<RequiresContent> = {
  name: "NewCodeCellAbove",
  *makeActionTemplates() {
    yield actions.createCellAbove.with({ cellType: "code" });
  },
};

export const NewCodeCellBelow: DesktopCommand<RequiresContent> = {
  name: "NewCodeCellBelow",
  *makeActionTemplates() {
    yield actions.createCellBelow.with({ cellType: "code", source: "" });
  },
};

export const NewTextCellBelow: DesktopCommand<RequiresContent> = {
  name: "NewTextCellBelow",
  *makeActionTemplates() {
    yield actions.createCellBelow.with({ cellType: "markdown", source: "" });
  },
};

export const NewRawCellBelow: DesktopCommand<RequiresContent> = {
  name: "NewRawCellBelow",
  *makeActionTemplates() {
    yield actions.createCellBelow.with({ cellType: "raw", source: "" });
  },
};
