// @flow

import type { ChildProcess } from "child_process"; // eslint-disable-line no-unused-vars

import { shutdownKernel } from "../kernel/shutdown";

import { makeAppRecord } from "@nteract/types/core/records";

import type { Channels } from "@nteract/types/channels";

declare class AppState {
  channels: Channels;
  spawn: ChildProcess;
  connectionFile: string;
  kernelSpecName: string;
  kernelSpecDisplayName: string;
  kernelSpec: Object;
  executionState: string;
  token: string;
  notificationSystem: Object;
  set(string, any): AppState;
  withMutations(any): AppState;
}

function cleanupKernel(state: AppState): AppState {
  const kernel = {
    channels: state.channels,
    spawn: state.spawn,
    connectionFile: state.connectionFile
  };
  shutdownKernel(kernel);

  return state.withMutations((ctx: AppState) =>
    ctx
      .set("channels", null)
      .set("spawn", null)
      .set("connectionFile", null)
      .set("kernelSpecName", null)
      .set("kernelSpecDisplayName", null)
      .set("kernelSpec", null)
      .set("executionState", "not connected")
  );
}

type NewKernelAction = {
  type: "NEW_KERNEL",
  channels: Channels,
  connectionFile: string,
  spawn: ChildProcess,
  kernelSpecName: string,
  kernelSpec: Object
};

function newKernel(state: AppState, action: NewKernelAction) {
  return cleanupKernel(state).withMutations((ctx: AppState) =>
    ctx
      .set("channels", action.channels)
      .set("connectionFile", action.connectionFile)
      .set("spawn", action.spawn)
      .set("kernelSpecName", action.kernelSpecName)
      .set("kernelSpecDisplayName", action.kernelSpec.spec.display_name)
      .set("kernelSpec", action.kernelSpec)
      .set("executionState", "starting")
  );
}
function exit(state: AppState) {
  return cleanupKernel(state);
}

function interruptKernel(state: AppState) {
  state.spawn.kill("SIGINT");
  return state;
}

function startSaving(state: AppState) {
  return state.set("isSaving", true);
}

type SetExecutionStateAction = {
  type: "SET_EXECUTION_STATE",
  executionState: string
};
function setExecutionState(state: AppState, action: SetExecutionStateAction) {
  return state.set("executionState", action.executionState);
}

function doneSaving(state: AppState) {
  return state.set("isSaving", false).set("lastSaved", new Date());
}

function doneSavingConfig(state: AppState) {
  return state.set("configLastSaved", new Date());
}

type SetNotificationSystemAction = {
  type: "SET_NOTIFICATION_SYSTEM",
  notificationSystem: Object
};
function setNotificationsSystem(
  state: AppState,
  action: SetNotificationSystemAction
) {
  return state.set("notificationSystem", action.notificationSystem);
}

type SetGithubTokenAction = { type: "SET_GITHUB_TOKEN", githubToken: string };
function setGithubToken(state: AppState, action: SetGithubTokenAction) {
  const { githubToken } = action;
  return state.set("token", githubToken);
}

type ExitAction = { type: "EXIT" };
type StartSavingAction = { type: "START_SAVING" };
type DoneSavingAction = { type: "DONE_SAVING" };
type DoneSavingConfigAction = { type: "DONE_SAVING_CONFIG" };
type InterruptKernelAction = { type: "INTERRUPT_KERNEL" };
type KillKernelAction = { type: "KILL_KERNEL" };

type AppAction =
  | NewKernelAction
  | SetGithubTokenAction
  | SetNotificationSystemAction
  | SetExecutionStateAction
  | ExitAction
  | StartSavingAction
  | InterruptKernelAction
  | KillKernelAction
  | DoneSavingAction
  | DoneSavingConfigAction;

const defaultAppState = makeAppRecord();

export default function handleApp(
  state: AppState = defaultAppState,
  action: AppAction
) {
  switch (action.type) {
    case "NEW_KERNEL":
      return newKernel(state, action);
    case "EXIT":
      return exit(state);
    case "KILL_KERNEL":
      return cleanupKernel(state);
    case "INTERRUPT_KERNEL":
      return interruptKernel(state);
    case "START_SAVING":
      return startSaving(state);
    case "SET_EXECUTION_STATE":
      return setExecutionState(state, action);
    case "DONE_SAVING":
      return doneSaving(state);
    case "DONE_SAVING_CONFIG":
      return doneSavingConfig(state);
    case "SET_NOTIFICATION_SYSTEM":
      return setNotificationsSystem(state, action);
    case "SET_GITHUB_TOKEN":
      return setGithubToken(state, action);
    default:
      return state;
  }
}
