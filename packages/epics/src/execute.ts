/**
 * @module epics
 */
import {
  createExecuteRequest,
  ofMessageType,
  childOf,
  outputs,
  payloads,
  kernelStatuses,
  executionCounts,
  JupyterMessage
} from "@nteract/messaging";
import { Channels, ExecuteRequest } from "@nteract/messaging";
import { Observable, of, merge, empty, throwError, Observer } from "rxjs";
import {
  groupBy,
  filter,
  map,
  mapTo,
  switchMap,
  mergeMap,
  mergeAll,
  takeUntil,
  catchError,
  concatMap,
  tap,
  share
} from "rxjs/operators";
import { ofType } from "redux-observable";
import { ActionsObservable, StateObservable } from "redux-observable";

import { ContentRef, PayloadMessage } from "@nteract/types";
import { AppState } from "@nteract/types";
import * as actions from "@nteract/actions";
import * as selectors from "@nteract/selectors";
import {
  LaunchKernelAction,
  LaunchKernelByNameAction,
  KillKernelAction,
  NewKernelAction,
  ExecuteCell,
  ExecuteFocusedCell,
  ExecuteAllCells,
  ExecuteAllCellsBelow,
  ExecuteCanceled,
  DeleteCell
} from "@nteract/actions";
import { CellId, Output, ImmutableCell } from "@nteract/commutable";

const Immutable = require("immutable");

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
  message: ExecuteRequest,
  contentRef: ContentRef
) {
  if (!channels || !channels.pipe) {
    return throwError(new Error("kernel not connected"));
  }

  const executeRequest = message;

  // All the streams intended for all frontends
  const cellMessages = channels.pipe(
    childOf(executeRequest),
    share()
  ) as Observable<JupyterMessage>;

  // All the payload streams, intended for one user
  const payloadStream = cellMessages.pipe(payloads());

  const cellAction$ = merge(
    payloadStream.pipe(
      map((payload: PayloadMessage) =>
        actions.acceptPayloadMessage({ id, payload, contentRef })
      )
    ),

    // All actions for updating cell status
    cellMessages.pipe(
      kernelStatuses() as any,
      map((status: string) =>
        actions.updateCellStatus({ id, status, contentRef })
      )
    ),

    // Update the input numbering: `[ ]`
    cellMessages.pipe(
      executionCounts() as any,
      map((ct: number) =>
        actions.updateCellExecutionCount({ id, value: ct, contentRef })
      )
    ),

    // All actions for new outputs
    cellMessages.pipe(
      outputs() as any,
      map((output: Output) => actions.appendOutput({ id, output, contentRef }))
    ),

    // clear_output display message
    cellMessages.pipe(
      ofMessageType("clear_output") as any,
      mapTo(actions.clearOutputs({ id, contentRef }))
    )
  );

  // On subscription, send the message
  return Observable.create((observer: Observer<any>) => {
    const subscription = cellAction$.subscribe(observer);
    channels.next(executeRequest);
    return subscription;
  });
}

export function createExecuteCellStream(
  action$: ActionsObservable<
    | ExecuteCanceled
    | DeleteCell
    | LaunchKernelAction
    | LaunchKernelByNameAction
    | KillKernelAction
    | ExecuteCell
    | ExecuteFocusedCell
  >,
  state: any,
  message: ExecuteRequest,
  id: string,
  contentRef: ContentRef
): Observable<any> {
  const kernel = selectors.currentKernel(state);

  const channels = kernel ? kernel.channels : null;

  const kernelConnected =
    kernel &&
    channels &&
    !(kernel.status === "starting" || kernel.status === "not connected");

  if (!kernelConnected || !channels) {
    return of(
      actions.executeFailed({
        error: new Error("Kernel not connected!"),
        contentRef
      })
    );
  }

  const cellStream = executeCellStream(channels, id, message, contentRef).pipe(
    takeUntil(
      merge(
        action$.pipe(
          ofType(actions.EXECUTE_CANCELED, actions.DELETE_CELL),
          filter(
            (
              action:
                | actions.ExecuteCanceled
                | actions.DeleteCell
                | actions.LaunchKernelAction
                | actions.LaunchKernelByNameAction
                | actions.KillKernelAction
                | actions.ExecuteCell
                | actions.ExecuteFocusedCell
            ) => (action as actions.ExecuteCanceled).payload.id === id
          )
        ),
        action$.pipe(
          ofType(
            actions.LAUNCH_KERNEL,
            actions.LAUNCH_KERNEL_BY_NAME,
            actions.KILL_KERNEL
          )
        )
      )
    )
  );

  return merge(
    // We make sure to propagate back to "ourselves" the actual message
    // that we sent to the kernel with the sendExecuteRequest action
    of(actions.sendExecuteRequest({ id, message, contentRef })),
    // Merging it in with the actual stream
    cellStream
  );
}

export function executeAllCellsEpic(
  action$: ActionsObservable<ExecuteAllCells | ExecuteAllCellsBelow>,
  state$: StateObservable<AppState>
) {
  return action$.pipe(
    ofType(actions.EXECUTE_ALL_CELLS, actions.EXECUTE_ALL_CELLS_BELOW),
    concatMap((action: ExecuteAllCells | ExecuteAllCellsBelow) => {
      const state = state$.value;
      const contentRef = action.payload.contentRef;

      const model = selectors.model(state, { contentRef });
      // If it's not a notebook, we shouldn't be here
      if (!model || model.type !== "notebook") {
        return empty();
      }

      let codeCellIds = Immutable.List();

      if (action.type === actions.EXECUTE_ALL_CELLS) {
        codeCellIds = selectors.notebook.codeCellIds(model);
      } else if (action.type === actions.EXECUTE_ALL_CELLS_BELOW) {
        codeCellIds = selectors.notebook.codeCellIdsBelow(model);
      }
      return of(
        ...codeCellIds.map((id: CellId) =>
          actions.executeCell({ id, contentRef: action.payload.contentRef })
        )
      );
    })
  );
}

/**
 * the execute cell epic processes execute requests for all cells, creating
 * inner observable streams of the running execution responses
 */
export function executeCellEpic(
  action$: ActionsObservable<ExecuteCell | ExecuteFocusedCell>,
  state$: any
) {
  return action$.pipe(
    ofType(actions.EXECUTE_CELL, actions.EXECUTE_FOCUSED_CELL),
    mergeMap((action: ExecuteCell | ExecuteFocusedCell) => {
      if (action.type === actions.EXECUTE_FOCUSED_CELL) {
        const contentRef = action.payload.contentRef;
        const state = state$.value;
        const model = selectors.model(state, { contentRef });
        // If it's not a notebook, we shouldn't be here
        if (!model || model.type !== "notebook") {
          return empty();
        }

        const id = model.cellFocused;

        if (!id) {
          throw new Error("attempted to execute without an id");
        }
        return of(
          actions.executeCell({ id, contentRef: action.payload.contentRef })
        );
      }
      return of(action);
    }),
    tap((action: ExecuteCell) => {
      if (!action.payload.id) {
        throw new Error("execute cell needs an id");
      }
    }),
    // Split stream by cell IDs
    groupBy((action: ExecuteCell) => action.payload.id),
    // Work on each cell's stream
    map(cellAction$ =>
      cellAction$.pipe(
        // When a new EXECUTE_CELL comes in with the current ID, we create a
        // a new stream and unsubscribe from the old one.
        switchMap((action: ExecuteCell) => {
          const { id } = action.payload;

          const state = state$.value;

          const contentRef = action.payload.contentRef;
          const model = selectors.model(state, { contentRef });

          // If it's not a notebook, we shouldn't be here
          if (!model || model.type !== "notebook") {
            return empty();
          }

          const cell = selectors.notebook.cellById(model, {
            id
          });
          if (!cell) {
            return empty();
          }

          // We only execute code cells
          if ((cell as any).get("cell_type") === "code") {
            const source = cell.get("source", "");

            const message = createExecuteRequest(source);

            return createExecuteCellStream(
              action$,
              state,
              message,
              id,
              action.payload.contentRef
            ).pipe(
              catchError((error, source) =>
                merge(
                  of(
                    actions.executeFailed({
                      error,
                      contentRef: action.payload.contentRef
                    })
                  ),
                  source
                )
              )
            );
          }
          return empty();
        })
      )
    ),
    // Bring back all the inner Observables into one stream
    mergeAll(),
    catchError((error: Error, source) => {
      // Either we ensure that all errors are caught when the action.payload.contentRef
      // is in scope or we make this be a generic ERROR
      // $FlowFixMe: see above
      return merge(
        of(
          actions.executeFailed({
            error
          })
        ),
        source
      );
    })
  );
}

export const updateDisplayEpic = (
  action$: ActionsObservable<NewKernelAction>
) =>
  // Global message watcher so we need to set up a feed for each new kernel
  action$.pipe(
    ofType(actions.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction) =>
      action.payload.kernel.channels.pipe(
        ofMessageType("update_display_data"),
        map((msg: JupyterMessage) =>
          actions.updateDisplay({
            content: msg.content,
            contentRef: action.payload.contentRef
          })
        ),
        catchError(error =>
          of(
            actions.updateDisplayFailed({
              error,
              contentRef: action.payload.contentRef
            })
          )
        )
      )
    )
  );
