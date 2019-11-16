import { epics as coreEpics } from "@nteract/core";
import { ActionsObservable, Epic, StateObservable } from "redux-observable";
import { Observable } from "rxjs";
import { catchError, startWith } from "rxjs/operators";
import { DesktopNotebookAppState } from "../state";

import {
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic
} from "../../common/epics/config";
import { closeNotebookEpic } from "./close-notebook";
import { publishEpic } from "./github-publish";
import {
  fetchContentEpic,
  launchKernelWhenNotebookSetEpic,
  newNotebookEpic
} from "./loading";
import { saveAsEpic, saveEpic } from "./saving";
import {
  interruptKernelEpic,
  killKernelEpic,
  launchKernelByNameEpic,
  launchKernelEpic,
  watchSpawn
} from "./zeromq-kernels";

import { Actions } from "../actions";

export function retryAndEmitError(err: Error, source: Observable<Actions>) {
  console.error(err);
  return source.pipe(startWith({ type: "ERROR", payload: err, error: true }));
}

export const wrapEpic = (epic: Epic<Actions, Actions>) => (
  ...args: [
    ActionsObservable<Actions>,
    StateObservable<DesktopNotebookAppState>,
    undefined
  ]
) => epic(...args).pipe(catchError(retryAndEmitError));

const epics = [
  coreEpics.restartKernelEpic,
  coreEpics.acquireKernelInfoEpic,
  coreEpics.watchExecutionStateEpic,
  coreEpics.executeCellEpic,
  coreEpics.updateDisplayEpic,
  coreEpics.commListenEpic,
  coreEpics.executeAllCellsEpic,
  coreEpics.updateContentEpic,
  coreEpics.autoSaveCurrentContentEpic,
  coreEpics.sendInputReplyEpic,

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
];

export default epics.map<Epic<Actions, Actions, DesktopNotebookAppState>>(
  epic => wrapEpic((epic as unknown) as any)
);
