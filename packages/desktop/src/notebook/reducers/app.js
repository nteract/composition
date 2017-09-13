// @flow

import type { ChildProcess } from "child_process"; // eslint-disable-line no-unused-vars
import type { Channels } from "../kernel/shutdown";

import { shutdownKernel } from "../kernel/shutdown";

import { AppRecord } from "../records";

declare class AppState {
  channels: Channels,
  spawn: ChildProcess,
  connectionFile: string,
  kernelSpecName: string,
  kernelSpecDisplayName: string,
  kernelSpec: Object,
  executionState: string,
  token: string,
  notificationSystem: Object,
  set(string, any): AppState,
  withMutations(any): AppState
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

function alertKernelNotConnected(state: AppState) {
  return state.set("error", "Error: We're not connected to a runtime!");
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

type AppAction =
  | NewKernelAction
  | SetGithubTokenAction
  | SetNotificationSystemAction
  | SetExecutionStateAction;

const defaultAppState = AppRecord();

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
    case "ERROR_KERNEL_NOT_CONNECTED":
      return alertKernelNotConnected(state);
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
