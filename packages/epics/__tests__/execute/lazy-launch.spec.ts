import * as actions from "@nteract/actions";
import * as stateModule from "@nteract/types";
import { StateObservable } from "redux-observable";
import { of, Subject } from "rxjs";
import { toArray } from "rxjs/operators";

import {
  executeCellAfterKernelLaunchEpic,
  lazyLaunchKernelEpic
} from "../../src/execute";

const Immutable = require("immutable");

describe("executeCellAfterKernelLaunchEpic", () => {
  test("executes cell and clears message queue if kernel is ready", done => {
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
      actions.launchKernelSuccessful({
        contentRef: "fakeContentRef",
        kernel: fakeKernel,
        kernelRef: "fakeKernelRef",
        selectNextKernel: false
      })
    );

    const responseActions = [];
    executeCellAfterKernelLaunchEpic(action$, state$).subscribe(
      action => responseActions.push(action),
      err => {
        throw err;
      },
      () => {
        expect(responseActions).toEqual([
          actions.executeCell({
            id: "0",
            contentRef: "fakeContentRef"
          }),
          actions.clearMessageQueue()
        ]);
        done();
      }
    );
  });

  test("do nothing if kernel is shutting down", done => {
    const fakeKernel = stateModule.makeRemoteKernelRecord({
      status: "shutting down"
    });
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
      actions.launchKernelSuccessful({
        contentRef: "fakeContentRef",
        kernel: fakeKernel,
        kernelRef: "fakeKernelRef",
        selectNextKernel: false
      })
    );

    const responseActions = [];
    executeCellAfterKernelLaunchEpic(action$, state$).subscribe(
      action => responseActions.push(action),
      err => {
        throw err;
      },
      () => {
        expect(responseActions).toEqual([]);
        done();
      }
    );
  });
});

describe("lazyLaunchKernelEpic", () => {
  test("emits one launch kernel action for multiple execute cell", async () => {
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
          kernels: stateModule.makeKernelsRecord(),
          messages: stateModule.makeMessagesRecord()
        }),
        kernelRef: "fake"
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.executeCell({ id: "0", contentRef: "fakeContentRef" }),
      actions.executeCell({ id: "1", contentRef: "fakeContentRef" }),
      actions.executeCell({ id: "2", contentRef: "fakeContentRef" })
    );
    const responses = await lazyLaunchKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();
    expect(responses).toEqual([
      actions.launchKernelByName({
        contentRef: "fakeContentRef",
        cwd: "/",
        kernelRef: "fakeKernelRef",
        kernelSpecName: "python3",
        selectNextKernel: true
      })
    ]);
  });
});
