import { createMessage, ofMessageType, childOf } from "@nteract/messaging";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/observable/from";
import "rxjs/add/observable/merge";
import "rxjs/add/observable/throw";

import "rxjs/add/operator/pluck";
import "rxjs/add/operator/first";
import "rxjs/add/operator/groupBy";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/mergeAll";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/operator/catch";

Observable.prototype.childOf = childOf;
Observable.prototype.ofMessageType = ofMessageType;

import {
  createCellAfter,
  updateCellExecutionCount,
  updateCellSource,
  updateCellPagers,
  updateCellStatus,
  clearOutputs
} from "../actions";

import {
  NEW_KERNEL,
  REMOVE_CELL,
  ABORT_EXECUTION,
  ERROR_EXECUTING,
  ERROR_UPDATE_DISPLAY
} from "../constants";

const Immutable = require("immutable");

export const createErrorActionObservable = type => error =>
  Observable.of({
    type,
    payload: error,
    error: true
  });

/**
 * Create an object that adheres to the jupyter notebook specification.
 * http://jupyter-client.readthedocs.io/en/latest/messaging.html
 *
 * @param {Object} msg - Message that has content which can be converted to nbformat
 * @return {Object} formattedMsg  - Message with the associated output type
 */
export function msgSpecToNotebookFormat(msg) {
  return Object.assign({}, msg.content, {
    output_type: msg.header.msg_type
  });
}

/**
 * Insert the content requisite for a code request to a kernel message.
 *
 * @param {String} code - Code to be executed in a message to the kernel.
 * @return {Object} msg - Message object containing the code to be sent.
 */
export function createExecuteRequest(code) {
  const executeRequest = createMessage("execute_request");
  executeRequest.content = {
    code,
    silent: false,
    store_history: true,
    user_expressions: {},
    allow_stdin: false,
    stop_on_error: false
  };
  return executeRequest;
}

/**
 * Reads a payloadStream and inspects it for pager data to be dispatched upon
 * specific cell executions.
 *
 * @param {String} id - Universally Unique ID of the cell message.
 * @param {Observable<Action>} payloadStream - Stream containing messages from the
 * kernel.
 * @return {Observable<Action>} pagerDataStream - Observable stream containing
 * Pager data.
 */
export function createPagerActions(id, payloadStream) {
  return payloadStream
    .filter(p => p.source === "page")
    .scan((acc, pd) => acc.push(Immutable.fromJS(pd)), new Immutable.List())
    .map(pagerDatas => updateCellPagers(id, pagerDatas));
}

/**
 * Emits `createSourceUpdateAction` to update the source of a cell if the
 * kernel has requested so by setting `replace` to true.
 *
 * @param {String} id -  Universally Unique Identifier of cell receiving
 * messages.
 * @param {Observable<Action>} setInputStream - Stream containing messages from the kernel.
 * @return {Observable<Action>} updateSourceStream - Stream with updateCellSource actions.
 */
export function createSourceUpdateAction(id, setInputStream) {
  return setInputStream
    .filter(x => x.replace)
    .pluck("text")
    .map(text => updateCellSource(id, text));
}

/**
 * Emits a `createCellAfter` action into a group of messages.
 *
 * @param {String} id -  Universally Unique Identifier of cell to have a cell
 * created after it.
 * @param {Object} setInputStream - Stream that contains a subset of messages
 * from the kernel that instruct the frontend what it should do.
 * @return {Immutable.List<Object>} updatedOutputs - Outputs with updated
 * changes.
 */
export function createCellAfterAction(id, setInputStream) {
  return setInputStream
    .filter(x => !x.replace)
    .pluck("text")
    .map(text => createCellAfter("code", id, text));
}

/**
 * Emits a create cell status action into a group of messages.
 *
 * @param {String} id -  Universally Unique Identifier of cell receiving
 * an update in cell status.
 * @param {Observable<jmp.Message>} cellMessages - Messages to receive create cell status action.
 * @return {Observable<jmp.Message>} updatedCellMessages - Updated messages.
 */
export function createCellStatusAction(id, cellMessages) {
  return cellMessages
    .ofMessageType(["status"])
    .pluck("content", "execution_state")
    .map(status => updateCellStatus(id, status));
}

/**
 * Cells are numbered according to the order in which they were executed.
 * http://jupyter-client.readthedocs.io/en/latest/messaging.html#execution-counter-prompt-number
 * This code emits an action to update the cell execution count.
 *
 * @param {String} id -  Universally Unique Identifier of cell receiving an
 * update to the execution count.
 * @param {Observable<jmp.Message>} cellMessages - Messages to receive updates.
 * @return {Observable<jmp.Message>} cellMessages - Updated messages.
 */
export function updateCellNumberingAction(id, cellMessages) {
  return cellMessages
    .ofMessageType(["execute_input"])
    .pluck("content", "execution_count")
    .first()
    .map(ct => updateCellExecutionCount(id, ct));
}

/**
 * Creates a stream of APPEND_OUTPUT actions from notebook formatable messages.
 *
 * @param {String} id - Universally Unique Identifier of cell receiving
 * messages.
 * @param {Observable} cellMessages - Set of sent cell messages.
 * @return {Observable<Action>} actions - Stream of APPEND_OUTPUT actions.
 */
export function handleFormattableMessages(id, cellMessages) {
  return cellMessages
    .ofMessageType(["execute_result", "display_data", "stream", "error"])
    .map(msgSpecToNotebookFormat)
    .map(output => ({ type: "APPEND_OUTPUT", id, output }));
}

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
export function executeCellStream(channels, id, code) {
  if (!channels || !channels.iopub || !channels.shell) {
    return Observable.throw(new Error("kernel not connected"));
  }

  const executeRequest = createExecuteRequest(code);

  const { iopub, shell } = channels;

  // Payload streams in general
  const payloadStream = shell
    .childOf(executeRequest)
    .ofMessageType(["execute_reply"])
    .pluck("content", "payload")
    .filter(Boolean)
    .mergeMap(payloads => Observable.from(payloads));

  // Payload stream for setting the input, whether in place or "next"
  const setInputStream = payloadStream.filter(
    payload => payload.source === "set_next_input"
  );

  // All child messages for the cell
  const cellMessages = iopub.childOf(executeRequest);

  const cellAction$ = Observable.merge(
    // Clear cell outputs
    Observable.of(clearOutputs(id)),
    Observable.of(updateCellStatus(id, "busy")),
    // clear_output display message
    cellMessages.ofMessageType(["clear_output"]).mapTo(clearOutputs(id)),
    // Inline %load
    createSourceUpdateAction(id, setInputStream),
    // %load for the cell _after_
    createCellAfterAction(id, setInputStream),
    // Clear any old pager
    Observable.of(updateCellPagers(id, new Immutable.List())),
    // Update the doc/pager section with new bundles
    createPagerActions(id, payloadStream),
    // Set the cell status
    createCellStatusAction(id, cellMessages),
    // Update the input numbering: `[ ]`
    updateCellNumberingAction(id, cellMessages),
    // Handle all nbformattable messages
    handleFormattableMessages(id, cellMessages)
  );

  // On subscription, send the message
  return Observable.create(observer => {
    const subscription = cellAction$.subscribe(observer);
    channels.shell.next(executeRequest);
    return subscription;
  });
}

export function createExecuteCellStream(action$, store, source, id) {
  const state = store.getState();
  const channels = state.app.channels;

  const kernelConnected =
    channels &&
    !(
      state.app.executionState === "starting" ||
      state.app.executionState === "not connected"
    );

  if (!kernelConnected) {
    return Observable.of({
      type: ERROR_EXECUTING,
      payload: "Kernel not connected!",
      error: true
    });
  }

  return executeCellStream(channels, id, source).takeUntil(
    action$
      .filter(laterAction => laterAction.id === id)
      .ofType(ABORT_EXECUTION, REMOVE_CELL)
  );
}

/**
 * the execute cell epic processes execute requests for all cells, creating
 * inner observable streams of the running execution responses
 */
export function executeCellEpic(action$, store) {
  return (
    action$
      .ofType("EXECUTE_CELL")
      .do(action => {
        if (!action.id) {
          throw new Error("execute cell needs an id");
        }
        if (typeof action.source !== "string") {
          throw new Error("execute cell needs source string");
        }
      })
      // Split stream by cell IDs
      .groupBy(action => action.id)
      // Work on each cell's stream
      .map(cellActionStream =>
        cellActionStream
          // When a new EXECUTE_CELL comes in with the current ID, we create a
          // a new stream and unsubscribe from the old one.
          .switchMap(({ source, id }) =>
            createExecuteCellStream(action$, store, source, id)
          )
      )
      // Bring back all the inner Observables into one stream
      .mergeAll()
      .catch((err, source) =>
        Observable.merge(
          createErrorActionObservable(ERROR_EXECUTING)(err),
          source
        )
      )
  );
}

export const updateDisplayEpic = action$ =>
  // Global message watcher so we need to set up a feed for each new kernel
  action$.ofType(NEW_KERNEL).switchMap(({ channels }) =>
    channels.iopub
      .ofMessageType(["update_display_data"])
      .map(msgSpecToNotebookFormat)
      // Convert 'update_display_data' to 'display_data'
      .map(output => Object.assign({}, output, { output_type: "display_data" }))
      .map(output => ({ type: "UPDATE_DISPLAY", output }))
      .catch(createErrorActionObservable(ERROR_UPDATE_DISPLAY))
  );
