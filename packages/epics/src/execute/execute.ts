import {
  Channels,
  childOf,
  executeRequest,
  ExecuteRequest,
  executionCounts,
  executionStatuses,
  executionErrors, 
  inputRequests,
  JupyterMessage,
  kernelStatuses,
  ofMessageType,
  outputs,
  payloads
} from "@nteract/messaging";
import { AnyAction } from "redux";
import { ofType } from "redux-observable";
import { StateObservable } from "redux-observable";
import { merge, Observable, of, Observer, GroupedObservable } from "rxjs";
import {
  catchError,
  filter,
  groupBy,
  map,
  mergeMap,
  share,
  switchMap,
  takeUntil,
  startWith
} from "rxjs/operators";

import * as actions from "@nteract/actions";
import { OnDiskOutput } from "@nteract/commutable";
import * as selectors from "@nteract/selectors";
import {
  AppState,
  ContentRef,
  InputRequestMessage,
  KernelStatus,
  PayloadMessage, 
  errors
} from "@nteract/types";

import { ExecuteReplyError } from "@nteract/messaging";

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
  const executeRequest = message;

  // All the streams intended for all frontends
  const cellMessages: Observable<JupyterMessage> = channels.pipe(
    childOf(executeRequest),
    share()
  );

  // All the payload streams, intended for one user
  const payloadStream = cellMessages.pipe(payloads());

  const cellAction$ = merge(
    payloadStream.pipe(
      map((payload: PayloadMessage) =>
        actions.acceptPayloadMessage({ id, payload, contentRef })
      )
    ),

    /**
     * Set the ISO datetime when the execute_input message
     * was broadcast from the kernel, per nbformat.
     */
    cellMessages.pipe(
      ofMessageType("execute_input"),
      map(() =>
        actions.setInCell({
          id,
          contentRef,
          path: ["metadata", "execution", "iopub.execute_input"],
          value: new Date().toISOString()
        })
      )
    ),

    /**
     * Set the ISO datetime when the execute_reply message
     * was broadcast from the kernel, per nbformat.
     */
    cellMessages.pipe(
      ofMessageType("execute_reply"),
      map(() =>
        actions.setInCell({
          id,
          contentRef,
          path: ["metadata", "execution", "shell.execute_reply"],
          value: new Date().toISOString()
        })
      )
    ),

    /**
     * Set the ISO datetime when the status associated with the
     * cell execution was sent from the kernel, per nbformat.
     */
    cellMessages.pipe(
      kernelStatuses(),
      map((status: string) =>
        actions.setInCell({
          id,
          contentRef,
          path: ["metadata", "execution", `iopub.status.${status}`],
          value: new Date().toISOString()
        })
      )
    ),

    // All actions for updating cell status
    cellMessages.pipe(
      kernelStatuses() as any,
      map((status: string) =>
        actions.updateCellStatus({ id, status, contentRef })
      )
    ),

    // Update the cell execution result from execute_reply.content.status
    cellMessages.pipe(
      executionStatuses() as any,
      map((result: string) =>
        actions.updateCellExecutionResult({ id, result, contentRef })
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
      map((output: OnDiskOutput) =>
        actions.appendOutput({ id, output, contentRef })
      )
    ),

    cellMessages.pipe(
      executionErrors() as any,
      map((error: ExecuteReplyError) => 
        actions.executeCanceled({ contentRef, id, code: errors.EXEC_CELL_RUNTIME_ERROR, error })
      )
    ),

    // clear_output display message
    cellMessages.pipe(
      ofMessageType("clear_output") as any,
      map(() => actions.clearOutputs({ id, contentRef }))
    ),

    // Prompt the user for input
    cellMessages.pipe(
      inputRequests() as any,
      map((inputRequest: InputRequestMessage) => {
        return actions.promptInputRequest({
          id,
          contentRef,
          prompt: inputRequest.prompt,
          password: inputRequest.password
        });
      })
    )
  );

  /**
   * When someone subscribes, dispatch the messge to the kernel
   * by calling `channels.next` then process the responses by proxying
   * to the inner Observable (cellAction$).
   */
  return Observable.create((observer: Observer<any>) => {
    const subscription = cellAction$.subscribe(observer);
    channels.next(executeRequest);
    return subscription;
  });
}

/**
 * A list of actions that indicate we probably want
 * to stop executing the current cell.
 */
type PerCellStopStopExecutionActions =
  | actions.ExecuteCanceled
  | actions.DeleteCell;
type ContentStopExecutionActions =
  | actions.LaunchKernelAction
  | actions.LaunchKernelByNameAction
  | actions.InterruptKernel
  | actions.RestartKernel
  | actions.KillKernelAction;
type StopExecutionActions =
  | PerCellStopStopExecutionActions
  | ContentStopExecutionActions;

type ExecuteStreamActions = StopExecutionActions | actions.SendExecuteRequest;

export function createExecuteCellStream(
  action$: Observable<ExecuteStreamActions>,
  channels: Channels,
  message: ExecuteRequest,
  id: string,
  contentRef: ContentRef
): Observable<any> {
  /**
   * Execute the individual cell, but stop if the execution is cancelled or the
   * cell is deleted.
   *
   * Also stop if a kernel is:
   * - launched
   * - interrupted
   * - killed
   * - restarted
   */
  const cellStream = executeCellStream(channels, id, message, contentRef).pipe(
    takeUntil(
      merge(
        action$.pipe(
          ofType(actions.EXECUTE_CANCELED, actions.DELETE_CELL),
          filter(
            (action: ExecuteStreamActions) => (action as PerCellStopStopExecutionActions).payload.id === id 
          )
        ),
        action$.pipe(
          ofType(
            actions.LAUNCH_KERNEL,
            actions.LAUNCH_KERNEL_BY_NAME,
            actions.KILL_KERNEL,
            actions.INTERRUPT_KERNEL,
            actions.RESTART_KERNEL
          ),
          filter(
            (action: ExecuteStreamActions) =>
              action.payload.contentRef === contentRef
          )
        )
      )
    )
  );

  /**
   * Begin the execution...
   */
  return cellStream.pipe(
    /**
     * But first dispatch some actions to...
     */
    startWith(
      /**
       * clear the existing contents of the cell
       */
      actions.clearOutputs({ id, contentRef }),
      /**
       * update the cell-status to queued
       */
      actions.updateCellStatus({ id, status: "queued", contentRef })
    )
  );
}

/**
 * the send execute request epic processes execute requests for all cells,
 * creating inner observable streams of the running execution responses
 */
export function sendExecuteRequestEpic(
  action$: Observable<actions.SendExecuteRequest>,
  state$: StateObservable<AppState>
) {
  return action$.pipe(
    ofType(actions.SEND_EXECUTE_REQUEST),
    /**
     * Split the stream of SendExecuteRequests that are being dispatched
     * globally on the Redux store to a seperate stream for each cell.
     *
     * This allows us to process each cell's execution lifecycle seperately
     * from other cells.
     */
    groupBy((action: actions.SendExecuteRequest) => action.payload.id),
    /**
     * We work (map) on each cell's stream individually and merge them
     * back together into a single stream where the per-cell grouping
     * is maintained.
     */
    mergeMap(
      (cellAction$: GroupedObservable<string, actions.SendExecuteRequest>) =>
        cellAction$.pipe(
          /**
           * When a new SendExecuteRequest comes for the same cell, the
           * switchMap allows us to stop executing the stream assocaited
           * with the previous execution request and start working on the
           * new one.
           */
          switchMap((action: actions.SendExecuteRequest) => {
            const { id } = action.payload;

            const state = state$.value;

            const contentRef = action.payload.contentRef;
            const model = selectors.model(state, { contentRef });

            /**
             * Currently, only notebooks can send execute requests
             * because the SendExecuteRequest passes a ContentRef and
             * a CellId. In the future, we can make this epic applicable
             * on all content-types by adding a `source` property to the
             * SendExecuteRequest action.
             */
            if (!model || model.type !== "notebook") {
              return of(
                actions.executeFailed({
                  error: new Error(
                    "Cannot send execute requests from non-notebook files."
                  ),
                  code: errors.EXEC_NOT_A_NOTEBOOK,
                  contentRef
                })
              );
            }

            /**
             * Retrieve the cell that we are targetting for execution.
             *
             * If it does not exist in the content, then throw an error
             * because something has gone wrong.
             *
             * This might mean that the wrong ContentRef and cellId pair
             * were passed or that the CellId doesn't exist in the notebook.
             */
            const cell = selectors.notebook.cellById(model, {
              id
            });
            if (!cell) {
              return of(
                actions.executeFailed({
                  error: new Error(
                    "Could not find the cell with the given CellId."
                  ),
                  code: errors.EXEC_NO_CELL_WITH_ID,
                  contentRef,
                  id
                })
              );
            }

            /**
             * Only code cells can be execute so we throw an error
             * if an attempt to execute a non-code cell is made.
             */
            if (cell.get("cell_type", null) != "code") {
              return of(
                actions.executeCanceled({
                  code: errors.EXEC_INVALID_CELL_TYPE,
                  contentRef,
                  id
                })
              );
            }

            /**
             * We cannot execute cells with no content, so
             * we through an error action if this is the case.
             */
            const source = cell.get("source", "");
            if (source === "") {
              return of(
                actions.executeCanceled({
                  code: errors.EXEC_NO_SOURCE_ERROR,
                  contentRef,
                  id
                })
              );
            }

            /**
             * Get the kernel associated with the content model that
             * we are aexecuting from and its channels. `channels` is
             * a WebSocketSubject that maintains a WebSocket connection
             * to the kernel via the /channels WebSocket endpoint on the
             * Jupyter server.
             */
            const kernel = selectors.kernelByContentRef(state, {
              contentRef
            });
            const channels = kernel ? kernel.channels : null;

            const kernelConnected =
              kernel &&
              !(
                kernel.status === KernelStatus.Starting ||
                kernel.status === KernelStatus.NotConnected
              );

            /**
             * If there is no kernel object for this content or the
             * kernel is in a processing state, then throw an error
             * action.
             */
            if (!kernelConnected) {
              return of(
                actions.executeFailed({
                  error: new Error(
                    "There is no connected kernel for this content."
                  ),
                  code: errors.EXEC_NO_KERNEL_ERROR,
                  contentRef
                })
              );
            }

            /**
             * If the channels WebSocketSubject doesn't look right, then
             * throw an error action.
             */
            if (!channels || !channels.pipe || !channels.next) {
              return of(
                actions.executeFailed({
                  error: new Error(
                    "The WebSocket associated with the target kernel is in a bad state."
                  ),
                  code: errors.EXEC_WEBSOCKET_ERROR,
                  contentRef
                })
              );
            }

            const message = executeRequest(source);

            return createExecuteCellStream(
              action$,
              channels,
              message,
              id,
              action.payload.contentRef
            ).pipe(
              /**
               * Catch uncaught exceptions that occur on
               * each cell's execution flow and dispatch
               * an action to the user.
               *
               * We do not subscribe back to the source stream
               * and restart the cell execution to avoid getting
               * caught in loops where the execution keeps failing.
               *
               * It's safe to say that if an error is raised here and
               * none of the guards above caught it, then we cannot
               * recover from it.
               *
               * We can continue adding specific guards above as we
               * discover new classes of errors.
               */
              catchError((error: Error) =>
                merge(
                  of(
                    actions.executeFailed({
                      error,
                      code: errors.EXEC_ERROR_IN_CELL_STREAM,
                      contentRef: action.payload.contentRef
                    })
                  )
                )
              )
            );
          })
        )
    ),
    catchError((error: Error, source: Observable<AnyAction>) => {
      /**
       * If any uncaught excpetions bubble here, then throw an error.
       * Note that we don't have access to the contentRef in this scope.
       *
       * When possible, it is best to throw executeFailed errors where
       * CellId and ContentRef information is present to avoid throwing
       * generic errors here.
       *
       * This catchError returns the source Observable to reset the
       * sendExecuteRequest epic in the event of unexpected failures.
       *
       * Note that SendExecuteRequest actions dispatched during the
       * reset will not be processed.
       */
      return merge(
        of(
          actions.executeFailed({
            error,
            code: errors.EXEC_EPIC_ERROR
          })
        ),
        source
      );
    })
  );
}
