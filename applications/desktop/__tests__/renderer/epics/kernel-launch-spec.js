import { ActionsObservable } from "redux-observable";
import { actions, actionTypes, makeStateRecord } from "@nteract/core";
import { toArray } from "rxjs/operators";

import {
  launchKernelObservable,
  launchKernelEpic,
  launchKernelByNameEpic
} from "../../../src/notebook/epics/zeromq-kernels";


describe("launchKernelObservable", () => {
  test("returns an observable", () => {
    const obs = launchKernelObservable("python3", process.cwd());
    expect(obs.subscribe).toBeTruthy();
  });
});

describe("launchKernelEpic", () => {
  test("throws an error if given a bad action", async function() {
    const action$ = ActionsObservable.of(
      {
        type: actionTypes.LAUNCH_KERNEL,
        payload: {
          kernelRef: "1234"
        }
      },
      {
        type: actionTypes.LAUNCH_KERNEL,
        payload: { kernelSpec: {} }
      }
    );

    const resultAction$ = await launchKernelEpic(action$)
      .pipe(toArray())
      .toPromise();
    expect(resultAction$).toEqual([
      {
        error: true,
        payload: {
          error: new Error("launchKernel needs a kernelSpec and a kernelRef"),
          kernelRef: "1234"
        },
        type: "LAUNCH_KERNEL_FAILED"
      },
      {
        error: true,
        payload: {
          error: new Error("launchKernel needs a kernelSpec and a kernelRef"),
          kernelRef: undefined
        },
        type: "LAUNCH_KERNEL_FAILED"
      }
    ]);
  });

  test("calls launchKernelObservable if given the correct action", async function() {
    const action$ = ActionsObservable.of(
      actions.launchKernel({
        kernelSpec: { spec: "hokey", name: "woohoo" },
        contentRef: "abc",
        cwd: "~",
        selectNextKernel: true,
        kernelRef: "123"
      })
    );

    const state = {
      core: makeStateRecord(),
      app: {
        kernel: null
      }
    };

    const responses = await launchKernelEpic(action$, { value: state })
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      actions.setKernelspecInfo({
        kernelInfo: { spec: "hokey", name: "woohoo" },
        contentRef: "abc"
      }),
      actions.launchKernelSuccessful({
        kernel: {
          info: null,
          kernelRef: expect.any(String),
          lastActivity: null,
          type: "zeromq",
          cwd: "~",
          hostRef: null,
          channels: expect.anything(),
          spawn: expect.anything(),
          connectionFile: "connectionFile.json",
          kernelSpecName: "woohoo",
          status: "launched"
        },
        selectNextKernel: true,
        contentRef: "abc",
        kernelRef: "123"
      }),
      actions.setExecutionState({
        kernelStatus: "launched",
        kernelRef: "123"
      })
    ]);
  });
});

describe("launchKernelByNameEpic", () => {
  test("creates a LAUNCH_KERNEL action in response to a LAUNCH_KERNEL_BY_NAME action", done => {
    const action$ = ActionsObservable.of(
      actions.launchKernelByName({
        kernelSpecName: "python3",
        cwd: "~"
      })
    );
    const obs = launchKernelByNameEpic(action$);
    obs.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionTypes.LAUNCH_KERNEL]);
        done();
      },
      err => done.fail(err)
    );
  });
});
