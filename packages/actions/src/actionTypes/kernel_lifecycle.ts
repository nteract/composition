// tslint:disable:max-line-length
import { KernelRef, KernelspecInfo, LocalKernelProps, RemoteKernelProps } from "@nteract/types";
import {
  Action,
  ErrorAction,
  HasContent,
  HasKernel,
  makeActionFunction,
  makeErrorActionFunction,
  MaybeHasContent,
  MaybeHasKernel
} from "../utils";

export type RestartKernelOutputHandling   = "None" | "Clear All" | "Run All";

export const INTERRUPT_KERNEL             = "INTERRUPT_KERNEL";
export const INTERRUPT_KERNEL_SUCCESSFUL  = "INTERRUPT_KERNEL_SUCCESSFUL";
export const INTERRUPT_KERNEL_FAILED      = "INTERRUPT_KERNEL_FAILED";
export const KILL_KERNEL                  = "KILL_KERNEL";
export const KILL_KERNEL_SUCCESSFUL       = "KILL_KERNEL_SUCCESSFUL";
export const KILL_KERNEL_FAILED           = "KILL_KERNEL_FAILED";
export const RESTART_KERNEL               = "RESTART_KERNEL";
export const RESTART_KERNEL_SUCCESSFUL    = "RESTART_KERNEL_SUCCESSFUL";
export const RESTART_KERNEL_FAILED        = "RESTART_KERNEL_FAILED";
export const CHANGE_KERNEL_BY_NAME        = "CHANGE_KERNEL_BY_NAME";
export const LAUNCH_KERNEL                = "LAUNCH_KERNEL";
export const LAUNCH_KERNEL_BY_NAME        = "LAUNCH_KERNEL_BY_NAME";
export const LAUNCH_KERNEL_SUCCESSFUL     = "LAUNCH_KERNEL_SUCCESSFUL";
export const LAUNCH_KERNEL_FAILED         = "LAUNCH_KERNEL_FAILED";
export const SHUTDOWN_REPLY_SUCCEEDED     = "SHUTDOWN_REPLY_SUCCEEDED";
export const SHUTDOWN_REPLY_TIMED_OUT     = "SHUTDOWN_REPLY_TIMED_OUT";
export const DISPOSE_KERNEL               = "DISPOSE_KERNEL";
export const KERNEL_AUTO_RESTARTED        = "KERNEL_AUTO_RESTARTED";

export type InterruptKernel               = Action     <typeof INTERRUPT_KERNEL,            MaybeHasContent & MaybeHasKernel>;
export type InterruptKernelSuccessful     = Action     <typeof INTERRUPT_KERNEL_SUCCESSFUL, MaybeHasContent & MaybeHasKernel>;
export type InterruptKernelFailed         = ErrorAction<typeof INTERRUPT_KERNEL_FAILED,     MaybeHasKernel>;
export type KillKernelAction              = Action     <typeof KILL_KERNEL,                 MaybeHasContent & MaybeHasKernel & { restarting: boolean; dispose?: boolean }>;
export type KillKernelSuccessful          = Action     <typeof KILL_KERNEL_SUCCESSFUL,      MaybeHasKernel>;
export type KillKernelFailed              = ErrorAction<typeof KILL_KERNEL_FAILED,          MaybeHasKernel>;
export type RestartKernel                 = Action     <typeof RESTART_KERNEL,              HasContent & MaybeHasKernel & { outputHandling: RestartKernelOutputHandling }>;
export type RestartKernelSuccessful       = Action     <typeof RESTART_KERNEL_SUCCESSFUL,   HasContent & HasKernel>;
export type RestartKernelFailed           = ErrorAction<typeof RESTART_KERNEL_FAILED,       HasContent & HasKernel>;
export type ChangeKernelByName            = Action     <typeof CHANGE_KERNEL_BY_NAME,       HasContent & { kernelSpecName: string; oldKernelRef?: KernelRef | null; }>;
export type LaunchKernelAction            = Action     <typeof LAUNCH_KERNEL,               HasContent & HasKernel & { kernelSpec: KernelspecInfo; cwd: string; selectNextKernel: boolean }>;
export type LaunchKernelByNameAction      = Action     <typeof LAUNCH_KERNEL_BY_NAME,       HasContent & HasKernel & { kernelSpecName?: string | null; cwd: string; selectNextKernel: boolean }>;
export type NewKernelAction               = Action     <typeof LAUNCH_KERNEL_SUCCESSFUL,    HasContent & HasKernel & { kernel: LocalKernelProps | RemoteKernelProps; selectNextKernel: boolean }>;
export type LaunchKernelFailed            = ErrorAction<typeof LAUNCH_KERNEL_FAILED,        MaybeHasContent & MaybeHasKernel>;
export type ShutdownReplySucceeded        = Action     <typeof SHUTDOWN_REPLY_SUCCEEDED,    HasKernel & { content: { restart: boolean } }>;
export type ShutdownReplyTimedOut         = Action     <typeof SHUTDOWN_REPLY_TIMED_OUT,    HasKernel>;
export type DisposeKernel                 = Action     <typeof DISPOSE_KERNEL,              HasKernel>;
export type KernelAutoRestarted           = Action     <typeof KERNEL_AUTO_RESTARTED,       HasKernel>;

export const interruptKernel              = makeActionFunction      <InterruptKernel>           (INTERRUPT_KERNEL);
export const interruptKernelSuccessful    = makeActionFunction      <InterruptKernelSuccessful> (INTERRUPT_KERNEL_SUCCESSFUL);
export const interruptKernelFailed        = makeErrorActionFunction <InterruptKernelFailed>     (INTERRUPT_KERNEL_FAILED);
export const killKernel                   = makeActionFunction      <KillKernelAction>          (KILL_KERNEL);
export const killKernelSuccessful         = makeActionFunction      <KillKernelSuccessful>      (KILL_KERNEL_SUCCESSFUL);
export const killKernelFailed             = makeErrorActionFunction <KillKernelFailed>          (KILL_KERNEL_FAILED);
export const restartKernel                = makeActionFunction      <RestartKernel>             (RESTART_KERNEL);
export const restartKernelSuccessful      = makeActionFunction      <RestartKernelSuccessful>   (RESTART_KERNEL_SUCCESSFUL);
export const restartKernelFailed          = makeErrorActionFunction <RestartKernelFailed>       (RESTART_KERNEL_FAILED);
export const changeKernelByName           = makeActionFunction      <ChangeKernelByName>        (CHANGE_KERNEL_BY_NAME);
export const launchKernel                 = makeActionFunction      <LaunchKernelAction>        (LAUNCH_KERNEL);
export const launchKernelByName           = makeActionFunction      <LaunchKernelByNameAction>  (LAUNCH_KERNEL_BY_NAME);
export const launchKernelSuccessful       = makeActionFunction      <NewKernelAction>           (LAUNCH_KERNEL_SUCCESSFUL);
export const launchKernelFailed           = makeErrorActionFunction <LaunchKernelFailed>        (LAUNCH_KERNEL_FAILED);
export const shutdownReplySucceeded       = makeActionFunction      <ShutdownReplySucceeded>    (SHUTDOWN_REPLY_SUCCEEDED);
export const shutdownReplyTimedOut        = makeActionFunction      <ShutdownReplyTimedOut>     (SHUTDOWN_REPLY_TIMED_OUT);
export const disposeKernel                = makeActionFunction      <DisposeKernel>             (DISPOSE_KERNEL);
export const kernelAutoRestarted          = makeActionFunction      <KernelAutoRestarted>       (KERNEL_AUTO_RESTARTED);