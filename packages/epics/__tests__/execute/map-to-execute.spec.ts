import * as actions from "@nteract/actions";
import * as stateModule from "@nteract/types";
import { mockAppState } from "@nteract/fixtures";
import { StateObservable } from "redux-observable";
import { of, Subject } from "rxjs";
import { toArray } from "rxjs/operators";

import { executeAllCellsEpic, executeCellEpic } from "../../src/execute";

const Immutable = require("immutable");

describe("executeAllCellsEpic", () => {
  test("returns an error action if no content given", done => {
    const state = mockAppState({});
    const action$ = of(
      actions.executeAllCells({ contentRef: "noContentForMe" })
    );
    const state$ = new StateObservable(new Subject(), state);
    const obs = executeAllCellsEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.EXECUTE_FAILED]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
  test("does nothing if the model is not a notebook", done => {
    const state = mockAppState({ codeCellCount: 2 });
    const contentRef = state.core.entities.contents.byRef.keySeq().first();
    const action$ = of(
      actions.executeAllCells({ contentRef })
    );
    const state$ = new StateObservable(new Subject(), state);
    const obs = executeAllCellsEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.EXECUTE_CELL, actions.EXECUTE_CELL]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});

describe("executeCell", () => {
  test("returns an executeCell action", () => {
    expect(
      actions.executeCell({ id: "0-0-0-0", contentRef: "fakeContentRef" })
    ).toEqual({
      type: actions.EXECUTE_CELL,
      payload: { id: "0-0-0-0", contentRef: "fakeContentRef" }
    });
  });
});

describe("executeCellEpic", () => {
  test("Map to SendExecuteRequest action when kernel launched", async () => {
    const fakeKernel = stateModule.makeRemoteKernelRecord({ status: "idle" });
    const fakeContent = stateModule
      .makeNotebookContentRecord()
      .setIn(["model", "kernelRef"], "fakeKernelRef");
    const state = {
      core: stateModule.makeStateRecord({
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              fakeContentRef: fakeContent
            })
          }),
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fakeKernelRef: fakeKernel
            })
          }),
          messages: stateModule.makeMessagesRecord({
            messageQueue: Immutable.List([
              {
                type: "ENQUEUE_ACTION",
                payload: {
                  contentRef: "fakeContentRef",
                  id: "0"
                }
              }
            ])
          })
        }),
        kernelRef: "fake"
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.executeCell({ id: "0", contentRef: "fakeContentRef" })
    );
    const responses = await executeCellEpic(action$, state$)
      .pipe(toArray())
      .toPromise();
    expect(responses).toEqual([
      actions.sendExecuteRequest({ id: "0", contentRef: "fakeContentRef" })
    ]);
  });

  test("Adds action to message queue if kernel is not launched", async () => {
    const fakeContent = stateModule.makeNotebookContentRecord();
    const state = {
      core: stateModule.makeStateRecord({
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              fakeContentRef: fakeContent
            })
          }),
          kernels: stateModule.makeKernelsRecord(),
          messages: stateModule.makeMessagesRecord()
        }),
        kernelRef: "fake"
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.executeCell({ id: "0", contentRef: "fakeContentRef" })
    );
    const responses = await executeCellEpic(action$, state$)
      .pipe(toArray())
      .toPromise();
    expect(responses).toEqual([
      actions.updateCellStatus({
        id: "0",
        contentRef: "fakeContentRef",
        status: "queued"
      }),
      actions.enqueueAction({ id: "0", contentRef: "fakeContentRef" })
    ]);
  });
});
