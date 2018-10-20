/* @flow strict */
import { catchError, startWith } from "rxjs/operators";
import { saveEpic, saveAsEpic } from "./saving";

import {
  fetchContentEpic,
  newNotebookEpic,
  launchKernelWhenNotebookSetEpic
} from "./loading";

import type { ActionsObservable, Epic } from "redux-observable";

import {
  launchKernelEpic,
  launchKernelByNameEpic,
  interruptKernelEpic,
  killKernelEpic,
  watchSpawn
} from "./zeromq-kernels";

import { epics as coreEpics } from "@nteract/core";

import { publishEpic } from "./github-publish";

import {
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic
} from "./config";

import { closeNotebookEpic } from "./close-notebook";

export function retryAndEmitError(err: Error, source: ActionsObservable<*>) {
  console.error(err);
  return source.pipe(startWith({ type: "ERROR", payload: err, error: true }));
}

export const wrapEpic = (epic: Epic<*, *, *, *>) => (...args: *) =>
  epic(...args).pipe(catchError(retryAndEmitError));

const epics: Array<Epic<*, *, *, *>> = [
  coreEpics.restartKernelEpic,
  coreEpics.acquireKernelInfoEpic,
  coreEpics.watchExecutionStateEpic,
  coreEpics.executeCellEpic,
  coreEpics.updateDisplayEpic,
  coreEpics.commListenEpic,
  coreEpics.executeAllCellsEpic,

  launchKernelWhenNotebookSetEpic,
  watchSpawn,
  publishEpic,
  saveEpic,
  saveAsEpic,
  fetchContentEpic,
  newNotebookEpic,
  launchKernelEpic,
  launchKernelByNameEpic,
  interruptKernelEpic,
  killKernelEpic,
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic,
  closeNotebookEpic
].map(wrapEpic);

export default epics;
