import { CellCommandSets, GapCommandSets } from "../model";
import { CELL_COMMANDS as CELL_COMMANDS_CELL } from "./cell";
import { CELL_COMMANDS as CELL_COMMANDS_PAPERMILL } from "./papermill";
import { CELL_COMMANDS as CELL_COMMANDS_CODE, GAP_COMMANDS as GAP_COMMANDS_CODE } from "./renderer-code";
import { CELL_COMMANDS as CELL_COMMANDS_MARKDOWN, GAP_COMMANDS as GAP_COMMANDS_MARKDOWN } from "./renderer-markdown";

export const COMMANDS = {
  CELL: ([] as CellCommandSets).concat(
    CELL_COMMANDS_CELL,
    CELL_COMMANDS_CODE,
    CELL_COMMANDS_MARKDOWN,
    CELL_COMMANDS_PAPERMILL,
  ),
  GAP: ([] as GapCommandSets).concat(
    GAP_COMMANDS_CODE,
    GAP_COMMANDS_MARKDOWN,
  ),
};
