// tslint:disable:max-line-length
import { Action, ErrorAction, HasCell, HasContent, HasKernel, makeActionFunction, makeErrorActionFunction, makeZeroArgActionFunction, MaybeHasContent } from "../utils";
import { CellId } from "@nteract/commutable";

export const SEND_EXECUTE_REQUEST     = "SEND_EXECUTE_REQUEST";
export const EXECUTE_CELL             = "EXECUTE_CELL";
export const EXECUTE_ALL_CELLS        = "EXECUTE_ALL_CELLS";
export const EXECUTE_ALL_CELLS_ABOVE  = "EXECUTE_ALL_CELLS_ABOVE";
export const EXECUTE_ALL_CELLS_BELOW  = "EXECUTE_ALL_CELLS_BELOW";
export const EXECUTE_FOCUSED_CELL     = "EXECUTE_FOCUSED_CELL";
export const EXECUTE_CANCELED         = "EXECUTE_CANCELED";
export const EXECUTE_FAILED           = "EXECUTE_FAILED";
export const SET_EXECUTION_STATE      = "SET_EXECUTION_STATE";
export const ENQUEUE_ACTION           = "ENQUEUE_ACTION";
export const CLEAR_MESSAGE_QUEUE      = "CLEAR_MESSAGE_QUEUE";

export type SendExecuteRequest        = Action     <typeof SEND_EXECUTE_REQUEST,    HasCell>;
export type ExecuteCell               = Action     <typeof EXECUTE_CELL,            HasCell>;
export type ExecuteAllCells           = Action     <typeof EXECUTE_ALL_CELLS,       HasContent>;
export type ExecuteAllCellsAbove      = Action     <typeof EXECUTE_ALL_CELLS_ABOVE, HasContent & { id?: CellId }>;
export type ExecuteAllCellsBelow      = Action     <typeof EXECUTE_ALL_CELLS_BELOW, HasContent & { id?: CellId }>;
export type ExecuteFocusedCell        = Action     <typeof EXECUTE_FOCUSED_CELL,    HasContent>;
export type ExecuteCanceled           = Action     <typeof EXECUTE_CANCELED,        HasCell & {code?: string; error?: any}>;
export type ExecuteFailed             = ErrorAction<typeof EXECUTE_FAILED,          MaybeHasContent & { id?: CellId }>;
export type SetExecutionStateAction   = Action     <typeof SET_EXECUTION_STATE,     HasKernel &  { kernelStatus: string }>;
export type EnqueueAction             = Action     <typeof ENQUEUE_ACTION,          HasCell>;
export type ClearMessageQueue         = Action     <typeof CLEAR_MESSAGE_QUEUE,     undefined>;

export const sendExecuteRequest       = makeActionFunction        <SendExecuteRequest>        (SEND_EXECUTE_REQUEST);
export const executeCell              = makeActionFunction        <ExecuteCell>               (EXECUTE_CELL);
export const executeAllCells          = makeActionFunction        <ExecuteAllCells>           (EXECUTE_ALL_CELLS);
export const executeAllCellsAbove     = makeActionFunction        <ExecuteAllCellsAbove>      (EXECUTE_ALL_CELLS_ABOVE);
export const executeAllCellsBelow     = makeActionFunction        <ExecuteAllCellsBelow>      (EXECUTE_ALL_CELLS_BELOW);
export const executeFocusedCell       = makeActionFunction        <ExecuteFocusedCell>        (EXECUTE_FOCUSED_CELL);
export const executeCanceled          = makeActionFunction        <ExecuteCanceled>           (EXECUTE_CANCELED);
export const executeFailed            = makeErrorActionFunction   <ExecuteFailed>             (EXECUTE_FAILED);
export const setExecutionState        = makeActionFunction        <SetExecutionStateAction>   (SET_EXECUTION_STATE);
export const enqueueAction            = makeActionFunction        <EnqueueAction>             (ENQUEUE_ACTION);
export const clearMessageQueue        = makeZeroArgActionFunction <ClearMessageQueue>         (CLEAR_MESSAGE_QUEUE);
