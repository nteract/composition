// tslint:disable:max-line-length
import { JSONObject, OnDiskOutput } from "@nteract/commutable";
import { JupyterMessage } from "@nteract/messaging";
import { Action, HasCell, HasContent, makeActionFunction, MaybeHasCell } from "../utils";

export const PROMPT_INPUT_REQUEST           = "PROMPT_INPUT_REQUEST";
export const SEND_INPUT_REPLY               = "SEND_INPUT_REPLY";
export const UNHIDE_ALL                     = "UNHIDE_ALL";
export const CLEAR_ALL_OUTPUTS              = "CLEAR_ALL_OUTPUTS";
export const TOGGLE_CELL_INPUT_VISIBILITY   = "TOGGLE_CELL_INPUT_VISIBILITY";
export const TOGGLE_CELL_OUTPUT_VISIBILITY  = "TOGGLE_CELL_OUTPUT_VISIBILITY";
export const CLEAR_OUTPUTS                  = "CLEAR_OUTPUTS";
export const UPDATE_OUTPUT_METADATA         = "UPDATE_OUTPUT_METADATA";
export const APPEND_OUTPUT                  = "APPEND_OUTPUT";
export const ACCEPT_PAYLOAD_MESSAGE         = "ACCEPT_PAYLOAD_MESSAGE";
export const TOGGLE_OUTPUT_EXPANSION        = "TOGGLE_OUTPUT_EXPANSION";

export type PromptInputRequest              = Action<typeof PROMPT_INPUT_REQUEST,           HasCell & { prompt: string; password: boolean }>;
export type SendInputReply                  = Action<typeof SEND_INPUT_REPLY,               HasContent & { value: string }>;
export type UnhideAll                       = Action<typeof UNHIDE_ALL,                     HasContent & { inputHidden?: boolean; outputHidden?: boolean }>;
export type ClearAllOutputs                 = Action<typeof CLEAR_ALL_OUTPUTS,              HasContent>;
export type ToggleCellInputVisibility       = Action<typeof TOGGLE_CELL_INPUT_VISIBILITY,   MaybeHasCell>;
export type ToggleCellOutputVisibility      = Action<typeof TOGGLE_CELL_OUTPUT_VISIBILITY,  MaybeHasCell>;
export type ClearOutputs                    = Action<typeof CLEAR_OUTPUTS,                  MaybeHasCell>;
export type UpdateOutputMetadata            = Action<typeof UPDATE_OUTPUT_METADATA,         HasCell & { metadata: JSONObject; index: number; mediaType: string }>;
export type AppendOutput                    = Action<typeof APPEND_OUTPUT,                  HasCell &  { output: OnDiskOutput }>;
export type AcceptPayloadMessage            = Action<typeof ACCEPT_PAYLOAD_MESSAGE,         HasCell &  { payload: JupyterMessage }>;
export type ToggleCellExpansion             = Action<typeof TOGGLE_OUTPUT_EXPANSION,        HasCell>;

export const promptInputRequest             = makeActionFunction<PromptInputRequest>        (PROMPT_INPUT_REQUEST);
export const sendInputReply                 = makeActionFunction<SendInputReply>            (SEND_INPUT_REPLY);
export const unhideAll                      = makeActionFunction<UnhideAll>                 (UNHIDE_ALL);
export const clearAllOutputs                = makeActionFunction<ClearAllOutputs>           (CLEAR_ALL_OUTPUTS);
export const toggleCellInputVisibility      = makeActionFunction<ToggleCellInputVisibility> (TOGGLE_CELL_INPUT_VISIBILITY);
export const toggleCellOutputVisibility     = makeActionFunction<ToggleCellOutputVisibility>(TOGGLE_CELL_OUTPUT_VISIBILITY);
export const clearOutputs                   = makeActionFunction<ClearOutputs>              (CLEAR_OUTPUTS);
export const updateOutputMetadata           = makeActionFunction<UpdateOutputMetadata>      (UPDATE_OUTPUT_METADATA);
export const appendOutput                   = makeActionFunction<AppendOutput>              (APPEND_OUTPUT);
export const toggleOutputExpansion          = makeActionFunction<ToggleCellExpansion>       (TOGGLE_OUTPUT_EXPANSION);
export const acceptPayloadMessage           = makeActionFunction<AcceptPayloadMessage>      (ACCEPT_PAYLOAD_MESSAGE);
