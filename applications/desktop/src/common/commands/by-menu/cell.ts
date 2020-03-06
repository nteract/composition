import { actions } from "@nteract/core";
import { DesktopCommand, RequiresContent } from "../types";

export const ChangeCellToCode: DesktopCommand<RequiresContent> = {
  name: "ChangeCellToCode",
  *makeActionTemplates() {
    yield actions.changeCellType.with({ to: "code" });
  },
};

export const ChangeCellToText: DesktopCommand<RequiresContent> = {
  name: "ChangeCellToText",
  *makeActionTemplates() {
    yield actions.changeCellType.with({ to: "markdown" });
  },
};

export const RunAll: DesktopCommand<RequiresContent> = {
  name: "RunAll",
  *makeActionTemplates() {
    yield actions.executeAllCells;
  },
};

export const RunAllBelow: DesktopCommand<RequiresContent> = {
  name: "RunAllBelow",
  *makeActionTemplates() {
    yield actions.executeAllCellsBelow;
  },
};

export const ClearAll: DesktopCommand<RequiresContent> = {
  name: "ClearAll",
  *makeActionTemplates() {
    yield actions.clearAllOutputs;
  },
};

export const UnhideAll: DesktopCommand<RequiresContent> = {
  name: "UnhideAll",
  *makeActionTemplates() {
    yield actions.unhideAll.with({ inputHidden: false, outputHidden: false });
  },
};
