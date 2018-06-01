// @flow
import {
  makeAppRecord,
  makeLocalKernelRecord,
  makeRemoteKernelRecord
} from "../state";

import type { AppRecord } from "../state";

import * as actionTypes from "../actionTypes";

import type {
  NewKernelAction,
  SetExecutionStateAction,
  SetNotificationSystemAction,
  SetGithubTokenAction,
  Save,
  SaveFailed,
  SaveFulfilled,
  GitListBranchSuccessfulAction
} from "../actionTypes";

function setGithubToken(state: AppRecord, action: SetGithubTokenAction) {
  const { githubToken } = action;
  return state.set("githubToken", githubToken);
}

function setCurrentBranch(
  state: AppRecord,
  action: GitListBranchSuccessfulAction
) {
  return state.set("currentBranch", action.payload.currentBranch);
}

function save(state: AppRecord) {
  return state.set("isSaving", true);
}

function saveFailed(state: AppRecord) {
  return state.set("isSaving", false);
}

function saveFulfilled(state: AppRecord) {
  return state.set("isSaving", false).set("lastSaved", new Date());
}

function setNotificationsSystem(
  state: AppRecord,
  action: SetNotificationSystemAction
) {
  return state.set("notificationSystem", action.notificationSystem);
}

export default function handleApp(
  state: AppRecord = makeAppRecord(),
  action:
    | SetNotificationSystemAction
    | SetGithubTokenAction
    | GitListBranchSuccessfulAction
    | Save
    | SaveFulfilled
    | SaveFailed
) {
  switch (action.type) {
    case actionTypes.GIT_LIST_BRANCH_SUCCESSFUL:
      return setCurrentBranch(state, action);
    case actionTypes.SAVE:
      return save(state);
    case actionTypes.SAVE_FAILED:
      return saveFailed(state);
    case actionTypes.SAVE_FULFILLED:
      return saveFulfilled(state);
    case actionTypes.SET_NOTIFICATION_SYSTEM:
      return setNotificationsSystem(state, action);
    case actionTypes.SET_GITHUB_TOKEN:
      return setGithubToken(state, action);
    default:
      return state;
  }
}
