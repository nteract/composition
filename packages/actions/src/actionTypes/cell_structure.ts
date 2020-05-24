// tslint:disable:max-line-length
import { CellId, CellType, ImmutableCell } from "@nteract/commutable";
import { Action, HasCell, HasContent, makeActionFunction, MaybeHasCell } from "../utils";

export const CREATE_CELL_BELOW    = "CREATE_CELL_BELOW";
export const CREATE_CELL_ABOVE    = "CREATE_CELL_ABOVE";
export const CREATE_CELL_APPEND   = "CREATE_CELL_APPEND";
export const MOVE_CELL            = "MOVE_CELL";
export const DELETE_CELL          = "DELETE_CELL";
export const CUT_CELL             = "CUT_CELL";
export const COPY_CELL            = "COPY_CELL";
export const PASTE_CELL           = "PASTE_CELL";

export type CreateCellBelow       = Action<typeof CREATE_CELL_BELOW,  MaybeHasCell & { cellType: CellType; cell?: ImmutableCell }>;
export type CreateCellAbove       = Action<typeof CREATE_CELL_ABOVE,  MaybeHasCell & { cellType: CellType; cell?: ImmutableCell }>;
export type CreateCellAppend = Action<typeof CREATE_CELL_APPEND, HasContent & { cellType: CellType; cell?: ImmutableCell }>;
export type MoveCell              = Action<typeof MOVE_CELL,          HasCell      & { destinationId: CellId; above: boolean }>;
export type DeleteCell            = Action<typeof DELETE_CELL,        MaybeHasCell>;
export type CutCell               = Action<typeof CUT_CELL,           MaybeHasCell>;
export type CopyCell              = Action<typeof COPY_CELL,          MaybeHasCell>;
export type PasteCell             = Action<typeof PASTE_CELL,         HasContent>;

export const createCellBelow      = makeActionFunction<CreateCellBelow>   (CREATE_CELL_BELOW);
export const createCellAbove      = makeActionFunction<CreateCellAbove>   (CREATE_CELL_ABOVE);
export const createCellAppend     = makeActionFunction<CreateCellAppend>  (CREATE_CELL_APPEND);
export const moveCell             = makeActionFunction<MoveCell>          (MOVE_CELL);
export const deleteCell           = makeActionFunction<DeleteCell>        (DELETE_CELL);
export const cutCell              = makeActionFunction<CutCell>           (CUT_CELL);
export const copyCell             = makeActionFunction<CopyCell>          (COPY_CELL);
export const pasteCell            = makeActionFunction<PasteCell>         (PASTE_CELL);
