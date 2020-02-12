import { epics as coreEpics } from "@nteract/core";
import { ActionsObservable, Epic, StateObservable } from "redux-observable";
import { Observable } from "rxjs";
import { catchError, startWith } from "rxjs/operators";
import { Actions } from "../actions";
import { DesktopNotebookAppState } from "../state";
import { closeNotebookEpic } from "./close-notebook";
import { publishEpic } from "./github-publish";
import { newNotebookEpic } from "./loading";
import { interruptKernelEpic, killKernelEpic, launchKernelByNameEpic, launchKernelEpic, watchSpawn } from "./zeromq-kernels";

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
  coreEpics.executeFocusedCellEpic,
  coreEpics.updateContentEpic,
  coreEpics.saveContentEpic,
  coreEpics.saveAsContentEpic,
  coreEpics.fetchContentEpic,
  coreEpics.autoSaveCurrentContentEpic,
  coreEpics.sendInputReplyEpic,
  coreEpics.executeCellAfterKernelLaunchEpic,
  coreEpics.sendExecuteRequestEpic,
  coreEpics.lazyLaunchKernelEpic,

  watchSpawn,
  publishEpic,
  newNotebookEpic,
  launchKernelEpic,
  launchKernelByNameEpic,
  interruptKernelEpic,
  killKernelEpic,
  closeNotebookEpic
];

export default epics.map<Epic<Actions, Actions, DesktopNotebookAppState>>(
  epic => wrapEpic((epic as unknown) as any)
);
