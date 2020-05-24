import { actions } from "@nteract/core";
import { DesktopCommand, ElectronRoleCommand, ReqContent } from "../types";

export const Cut: ElectronRoleCommand = {
  name: "Cut",
  mapToElectronRole: "cut",
};

export const Copy: ElectronRoleCommand = {
  name: "Copy",
  mapToElectronRole: "copy",
};

export const Paste: ElectronRoleCommand = {
  name: "Paste",
  mapToElectronRole: "paste",
};

export const SelectAll: ElectronRoleCommand = {
  name: "SelectAll",
  mapToElectronRole: "selectall",
};

export const CopyCell: DesktopCommand<ReqContent> = {
  name: "CopyCell",
  props: {
    contentRef: "required",
  },
  makeAction: actions.copyCell,
};

export const CutCell: DesktopCommand<ReqContent> = {
  name: "CutCell",
  props: {
    contentRef: "required",
  },
  makeAction: actions.cutCell,
};

export const PasteCell: DesktopCommand<ReqContent> = {
  name: "PasteCell",
  props: {
    contentRef: "required",
  },
  makeAction: actions.pasteCell,
};

export const DeleteCell: DesktopCommand<ReqContent> = {
  name: "DeleteCell",
  props: {
    contentRef: "required",
  },
  makeAction: actions.deleteCell,
};

export const NewCodeCellAbove: DesktopCommand<ReqContent> = {
  name: "NewCodeCellAbove",
  props: {
    contentRef: "required",
  },
  makeAction: actions.createCellAbove.with({ cellType: "code" }),
};

export const NewCodeCellBelow: DesktopCommand<ReqContent> = {
  name: "NewCodeCellBelow",
  props: {
    contentRef: "required",
  },
  makeAction: actions.createCellBelow.with({ cellType: "code", source: "" }),
};

export const NewTextCellBelow: DesktopCommand<ReqContent> = {
  name: "NewTextCellBelow",
  props: {
    contentRef: "required",
  },
  makeAction: actions.createCellBelow.with({
    cellType: "markdown",
    source: "",
  }),
};

export const NewRawCellBelow: DesktopCommand<ReqContent> = {
  name: "NewRawCellBelow",
  props: {
    contentRef: "required",
  },
  makeAction: actions.createCellBelow.with({ cellType: "raw", source: "" }),
};
