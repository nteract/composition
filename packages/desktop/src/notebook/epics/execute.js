// @flow
import {
  createMessage,
  createExecuteRequest,
  ofMessageType,
  childOf,
  updatedOutputs,
  outputs,
  payloads,
  executionStates,
  executionCounts
} from "@nteract/messaging";

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";
import { _throw } from "rxjs/observable/throw";

import {
  groupBy,
  filter,
  scan,
  map,
  mapTo,
  switchMap,
  startWith,
  mergeAll,
  takeUntil,
  catchError,
  tap
} from "rxjs/operators";

import {
  createCellAfter,
  updateCellExecutionCount,
  updateCellSource,
  updateCellPagers,
  updateCellStatus,
  clearOutputs
} from "@nteract/core/actions";

import type { Subject } from "rxjs/Subject";
import type { ActionsObservable } from "redux-observable";

import {
  NEW_KERNEL,
  REMOVE_CELL,
  ABORT_EXECUTION,
  ERROR_EXECUTING,
  ERROR_UPDATE_DISPLAY
} from "@nteract/core/constants";

const Immutable = require("immutable");

type Channels = {
  iopub: Subject<*>,
  shell: Subject<*>
};

/**
 * Observe all the reactions to running code for cell with id.
 *
 * @param {Subject} channels - The standard channels specified in the Jupyter
 * specification.
 * @param {String} id - Universally Unique Identifier of cell to be executed.
 * @param {String} code - Source code to be executed.
 * @return {Observable<Action>} updatedOutputs - It returns an observable with
 * a stream of events that need to happen after a cell has been executed.
 */
export function executeCellStream(
  channels: Channels,
  id: string,
  code: string
) {
  if (!channels || !channels.iopub || !channels.shell) {
    return _throw(new Error("kernel not connected"));
  }

  const executeRequest = createExecuteRequest(code);

  const { iopub, shell } = channels;

  // All the payload streams, intended for one user (since it's the shell channel)
  const payloadStream = shell.pipe(childOf(executeRequest), payloads());

  // All the streams intended for all frontends (since it's the iopub channel)
  const cellMessages = iopub.pipe(childOf(executeRequest));

  const cellAction$ = merge(
    // help menu in IPython
    // TODO: This should let the reducer in redux do the clear and append instead
    payloadStream.pipe(
      filter(p => p.source === "page"),
      // TODO: Switch to "APPEND_PAGER" action
      scan((acc, pd) => acc.push(pd.data), new Immutable.List()),
      map(pagerDatas => updateCellPagers(id, pagerDatas)),
      // TODO: Switch to "CLEAR_PAGER" action
      // TODO: Consider a RESET_CELL action that would clear out outputs, pagers, etc.
      startWith(updateCellPagers(id, new Immutable.List()))
    ),

    // set_next_input
    payloadStream.pipe(
      filter(payload => payload.source === "set_next_input"),
      map(
        c =>
          c.replace
            ? updateCellSource(id, c.text)
            : createCellAfter("code", id, c.text)
      )
    ),

    // All actions for updating cell status
    cellMessages.pipe(
      executionStates(),
      map(status => updateCellStatus(id, status)),
      startWith(updateCellStatus(id, "busy"))
    ),

    // Update the input numbering: `[ ]`
    cellMessages.pipe(
      executionCounts(),
      map(ct => updateCellExecutionCount(id, ct))
    ),

    // All actions for new outputs
    cellMessages.pipe(
      outputs(),
      map(output => ({ type: "APPEND_OUTPUT", id, output })),
      startWith(clearOutputs(id))
    ),

    // clear_output display message
    cellMessages.pipe(ofMessageType("clear_output"), mapTo(clearOutputs(id)))
  );

  // On subscription, send the message
  return Observable.create(observer => {
    const subscription = cellAction$.subscribe(observer);
    channels.shell.next(executeRequest);
    return subscription;
  });
}

export function createExecuteCellStream(
  action$: ActionsObservable<*>,
  store: any,
  source: string,
  id: string
) {
  const state = store.getState();
  const channels = state.app.channels;

  const kernelConnected =
    channels &&
    !(
      state.app.executionState === "starting" ||
      state.app.executionState === "not connected"
    );

  if (!kernelConnected) {
    return of({
      type: ERROR_EXECUTING,
      payload: "Kernel not connected!",
      error: true
    });
  }

  return executeCellStream(channels, id, source).pipe(
    takeUntil(
      action$
        .pipe(filter(laterAction => laterAction.id === id))
        .ofType(ABORT_EXECUTION, REMOVE_CELL)
    )
  );
}

/**
 * the execute cell epic processes execute requests for all cells, creating
 * inner observable streams of the running execution responses
 */
export function executeCellEpic(action$: ActionsObservable<*>, store: any) {
  return action$.ofType("EXECUTE_CELL").pipe(
    tap(action => {
      if (!action.id) {
        throw new Error("execute cell needs an id");
      }
      if (typeof action.source !== "string") {
        throw new Error("execute cell needs source string");
      }
    }),
    // Split stream by cell IDs
    groupBy(action => action.id),
    // Work on each cell's stream
    map(cellActionStream =>
      cellActionStream.pipe(
        // When a new EXECUTE_CELL comes in with the current ID, we create a
        // a new stream and unsubscribe from the old one.
        switchMap(({ source, id }) =>
          createExecuteCellStream(action$, store, source, id)
        )
      )
    ),
    // Bring back all the inner Observables into one stream
    mergeAll(),
    catchError((err, source) =>
      merge(of({ type: ERROR_EXECUTING, payload: err, error: true }), source)
    )
  );
}

export const updateDisplayEpic = (action$: ActionsObservable<*>) =>
  // Global message watcher so we need to set up a feed for each new kernel
  action$
    .ofType(NEW_KERNEL)
    .pipe(
      switchMap(({ channels }) =>
        channels.iopub.pipe(
          updatedOutputs(),
          map(output => ({ type: "UPDATE_DISPLAY", output })),
          catchError(err =>
            of({ type: ERROR_UPDATE_DISPLAY, payload: err, error: true })
          )
        )
      )
    );
