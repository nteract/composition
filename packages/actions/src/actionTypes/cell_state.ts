// tslint:disable:max-line-length
import { CellType } from "@nteract/commutable";
import { Action, HasCell, makeActionFunction, MaybeHasCell } from "../utils";

export const TOGGLE_TAG_IN_CELL            = "CORE/TOGGLE_TAG_IN_CELL";
export const CHANGE_CELL_TYPE              = "CHANGE_CELL_TYPE";
export const UPDATE_CELL_STATUS            = "UPDATE_CELL_STATUS";
export const MARK_CELL_AS_DELETING         = "MARK_CELL_AS_DELETING";
export const UNMARK_CELL_AS_DELETING       = "UNMARK_CELL_AS_DELETING";
export const SET_IN_CELL                   = "SET_IN_CELL";
export const UPDATE_CELL_EXECUTION_RESULT  = "UPDATE_CELL_EXECUTION_RESULT";

export type ChangeCellType                 = Action<typeof CHANGE_CELL_TYPE,                  MaybeHasCell & { to: CellType }>;
export type UpdateCellStatus               = Action<typeof UPDATE_CELL_STATUS,                HasCell      & { status: string }>;
export type ToggleTagInCell                = Action<typeof TOGGLE_TAG_IN_CELL,                HasCell      & { tag: string }>;
export type MarkCellAsDeleting             = Action<typeof MARK_CELL_AS_DELETING,             HasCell>;
export type UnmarkCellAsDeleting           = Action<typeof UNMARK_CELL_AS_DELETING,           HasCell>;
export type SetInCell             <T>      = Action<typeof SET_IN_CELL,                       HasCell      & { path: string[]; value: T }>;
export type UpdateCellExecutionResult      = Action<typeof UPDATE_CELL_EXECUTION_RESULT,      HasCell      & { result: string; }>;
     
export const changeCellType                = makeActionFunction<ChangeCellType>            (CHANGE_CELL_TYPE);
export const updateCellStatus              = makeActionFunction<UpdateCellStatus>          (UPDATE_CELL_STATUS);
export const toggleTagInCell               = makeActionFunction<ToggleTagInCell>           (TOGGLE_TAG_IN_CELL);
export const markCellAsDeleting            = makeActionFunction<MarkCellAsDeleting>        (MARK_CELL_AS_DELETING);
export const unmarkCellAsDeleting          = makeActionFunction<UnmarkCellAsDeleting>      (UNMARK_CELL_AS_DELETING);
export const updateCellExecutionResult     = makeActionFunction<UpdateCellExecutionResult> (UPDATE_CELL_EXECUTION_RESULT);

export const setInCell                     = <T>(payload: SetInCell<T>["payload"])   => makeActionFunction<SetInCell<T>>(SET_IN_CELL)(payload);
export const toggleParameterCell           = (payload: HasCell)                      => toggleTagInCell({...payload, tag: "parameters"}); // Tag comes via Papermill
export const updateCellSource              = (payload: HasCell & { value: string })  => setInCell({...payload, path: ["source"]});
export const updateCellExecutionCount      = (payload: HasCell & { value: number })  => setInCell({...payload, path: ["execution_count"]});
