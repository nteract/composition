/* @flow strict */
import { catchError, startWith } from "rxjs/operators";
import { epics as coreEpics } from "@nteract/core";
import type { AppState } from "@nteract/core";
import type { Epic } from "redux-observable";

import { saveEpic, saveAsEpic } from "./saving";
import {
  fetchContentEpic,
  newNotebookEpic,
  launchKernelWhenNotebookSetEpic
} from "./loading";
import {
  launchKernelEpic,
  launchKernelByNameEpic,
  interruptKernelEpic,
  killKernelEpic,
  watchSpawn
} from "./zeromq-kernels";
import { publishEpic } from "./github-publish";
import {
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic
} from "./config";
import { closeNotebookEpic } from "./close-notebook";

export function retryAndEmitError(
  err: Error,
  source: rxjs$Observable<redux$AnyAction>
) {
  console.error(err);
  return source.pipe(startWith({ type: "ERROR", payload: err, error: true }));
}

export const wrapEpic = (epic: Epic<AppState, redux$AnyAction, *>) => (
  ...args: *
) => epic(...args).pipe(catchError(retryAndEmitError));


const epics = [
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
];

// Type arguments are needed currently because of Flow export limitations
// https://github.com/facebook/flow/issues/6828#issuecomment-418495625
export default epics.map<Epic<AppState, redux$AnyAction, *>>(epic => wrapEpic(epic));;
