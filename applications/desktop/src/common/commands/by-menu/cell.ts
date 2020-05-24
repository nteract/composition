import { actions } from "@nteract/core";
import { DesktopCommand, ReqContent } from "../types";

export const ChangeCellToCode: DesktopCommand<ReqContent> = {
  name: "ChangeCellToCode",
  props: {
    contentRef: "required",
  },
  makeAction: actions.changeCellType.with({ to: "code" }),
};

export const ChangeCellToText: DesktopCommand<ReqContent> = {
  name: "ChangeCellToText",
  props: {
    contentRef: "required",
  },
  makeAction: actions.changeCellType.with({ to: "markdown" }),
};

export const RunAll: DesktopCommand<ReqContent> = {
  name: "RunAll",
  props: {
    contentRef: "required",
  },
  makeAction: actions.executeAllCells,
};

export const RunAllBelow: DesktopCommand<ReqContent> = {
  name: "RunAllBelow",
  props: {
    contentRef: "required",
  },
  makeAction: actions.executeAllCellsBelow,
};

export const ClearAll: DesktopCommand<ReqContent> = {
  name: "ClearAll",
  props: {
    contentRef: "required",
  },
  makeAction: actions.clearAllOutputs,
};

export const UnhideAll: DesktopCommand<ReqContent> = {
  name: "UnhideAll",
  props: {
    contentRef: "required",
  },
  makeAction: actions.unhideAll.with({
    inputHidden: false,
    outputHidden: false,
  }),
};
