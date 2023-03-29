// tslint:disable:max-line-length
import { KernelInfo, KernelspecRecord } from "@nteract/types";
import { Action, ErrorAction, HasContent, HasKernel, makeActionFunction, makeErrorActionFunction } from "../utils";

export const SET_KERNEL_INFO                      = "CORE/SET_KERNEL_INFO";
export const SET_KERNEL_METADATA                  = "SET_KERNEL_METADATA";
export const SET_LANGUAGE_INFO                    = "SET_LANGUAGE_INFO";
export const KERNEL_RAW_STDOUT                    = "KERNEL_RAW_STDOUT";
export const KERNEL_RAW_STDERR                    = "KERNEL_RAW_STDERR";
export const DELETE_CONNECTION_FILE_FAILED        = "DELETE_CONNECTION_FILE_FAILED";
export const DELETE_CONNECTION_FILE_SUCCESSFUL    = "DELETE_CONNECTION_FILE_SUCCESSFUL";

export type SetKernelInfo                         = Action     <typeof SET_KERNEL_INFO,                   HasContent & HasKernel & { info: KernelInfo }>;
export type SetKernelMetadata                     = Action     <typeof SET_KERNEL_METADATA,               HasContent & { kernelInfo: KernelspecRecord }>;
export type KernelRawStdout                       = Action     <typeof KERNEL_RAW_STDOUT,                 HasKernel & { text: string }>;
export type KernelRawStderr                       = Action     <typeof KERNEL_RAW_STDERR,                 HasKernel & { text: string }>;
export type DeleteConnectionFileFailedAction      = ErrorAction<typeof DELETE_CONNECTION_FILE_FAILED,     HasKernel>;
export type DeleteConnectionFileSuccessfulAction  = Action     <typeof DELETE_CONNECTION_FILE_SUCCESSFUL, HasKernel>;

export const setKernelInfo                        = makeActionFunction      <SetKernelInfo>                       (SET_KERNEL_INFO);
export const setKernelMetadata                    = makeActionFunction      <SetKernelMetadata>                   (SET_KERNEL_METADATA);
export const kernelRawStdout                      = makeActionFunction      <KernelRawStdout>                     (KERNEL_RAW_STDOUT);
export const kernelRawStderr                      = makeActionFunction      <KernelRawStderr>                     (KERNEL_RAW_STDERR);
export const deleteConnectionFileFailed           = makeErrorActionFunction <DeleteConnectionFileFailedAction>    (DELETE_CONNECTION_FILE_FAILED);
export const deleteConnectionFileSuccessful       = makeActionFunction      <DeleteConnectionFileSuccessfulAction>(DELETE_CONNECTION_FILE_SUCCESSFUL);
