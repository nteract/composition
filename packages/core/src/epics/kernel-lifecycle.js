/* @flow */

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { merge } from "rxjs/observable/merge";

import { createMessage, childOf, ofMessageType } from "@nteract/messaging";

import type { Notebook, ImmutableNotebook } from "@nteract/commutable";

const path = require("path");

import {
  filter,
  map,
  tap,
  mergeMap,
  catchError,
  first,
  pluck,
  switchMap
} from "rxjs/operators";

import { ActionsObservable, ofType } from "redux-observable";

import * as uuid from "uuid";

import type { Channels } from "@nteract/types/channels";

import type { NewKernelAction, SetNotebookAction } from "../actionTypes";

import type { KernelInfo, LocalKernelProps } from "@nteract/types/core/records";

import {
  setExecutionState,
  setNotebookKernelInfo,
  launchKernelSuccessful,
  launchKernel,
  setLanguageInfo,
  launchKernelByName
} from "../actions";

import { LAUNCH_KERNEL_SUCCESSFUL, SET_NOTEBOOK } from "../actionTypes";

/**
 * Sets the execution state after a kernel has been launched.
 *
 * @oaram  {ActionObservable}  action$ ActionObservable for LAUNCH_KERNEL_SUCCESSFUL action
 */
export const watchExecutionStateEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction) =>
      action.kernel.channels.pipe(
        filter(msg => msg.header.msg_type === "status"),
        map(msg => setExecutionState(msg.content.execution_state))
      )
    )
  );

/**
 * Send a kernel_info_request to the kernel.
 *
 * @param  {Object}  channels  A object containing the kernel channels
 * @returns  {Observable}  The reply from the server
 */
export function acquireKernelInfo(channels: Channels) {
  const message = createMessage("kernel_info_request");

  const obs = channels.pipe(
    childOf(message),
    ofMessageType("kernel_info_reply"),
    first(),
    pluck("content", "language_info"),
    map(setLanguageInfo)
  );

  return Observable.create(observer => {
    const subscription = obs.subscribe(observer);
    channels.next(message);
    return subscription;
  });
}

/**
 * Gets information about newly launched kernel.
 *
 * @param  {ActionObservable}  The action type
 */
export const acquireKernelInfoEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(LAUNCH_KERNEL_SUCCESSFUL),
    switchMap(action => acquireKernelInfo(action.kernel.channels))
  );

export const extractNewKernel = (
  filename?: string,
  notebook: ImmutableNotebook
) => {
  // TODO: There's some incongruence between desktop and web app here, regarding path vs. filename
  const cwd = (filename && path.dirname(filename)) || "/";

  const kernelSpecName = notebook.getIn(
    ["metadata", "kernelspec", "name"],
    notebook.getIn(["metadata", "language_info", "name"], "python3")
  );

  return {
    cwd,
    kernelSpecName
  };
};

export const launchKernelWhenNotebookSetEpic = (
  action$: ActionsObservable<*>
) =>
  action$.pipe(
    ofType(SET_NOTEBOOK),
    map((action: SetNotebookAction) => {
      const { cwd, kernelSpecName } = extractNewKernel(
        action.filename,
        action.notebook
      );

      return launchKernelByName(kernelSpecName, cwd);
    })
  );
