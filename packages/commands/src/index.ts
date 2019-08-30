import { COMMANDS } from "./commands";
import { makeCommandSetsComponent } from "./components";
import { CellTarget, CommandLocation, GapTarget, makeCellInfo, makeCellModelFromState, makeGapInfo, makeGapModel } from "./model";

export { COMMANDS };
export { CellTarget, CommandLocation, GapTarget, makeCellInfo, makeCellModelFromState, makeGapInfo, makeGapModel };

export const CellCommands =
  makeCommandSetsComponent(makeCellInfo, makeCellModelFromState, COMMANDS.CELL);

export const GapCommands =
  makeCommandSetsComponent(makeGapInfo, makeGapModel, COMMANDS.GAP);
