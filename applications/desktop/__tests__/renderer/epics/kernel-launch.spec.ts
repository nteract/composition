import { actions as actionsModule, makeStateRecord } from "@nteract/core";
import { of } from "rxjs";

import { toArray } from "rxjs/operators";

import {
  launchKernelByNameEpic,
  launchKernelEpic,
  launchKernelObservable
} from "../../../src/notebook/epics/zeromq-kernels";

describe("launchKernelObservable", () => {
  test("returns an observable", () => {
    const obs = launchKernelObservable("python3", process.cwd());
    expect(obs.subscribe).toBeTruthy();
  });
});

describe("launchKernelEpic", () => {
  test("throws an error if given a bad action", async () => {
    const action$ = of(
      {
        type: actionsModule.LAUNCH_KERNEL,
        payload: {
          kernelRef: "1234"
        }
      },
      {
        type: actionsModule.LAUNCH_KERNEL,
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
          contentRef: undefined,
          error: new Error("launchKernel needs a kernelSpec and a kernelRef"),
          kernelRef: "1234"
        },
        type: "LAUNCH_KERNEL_FAILED"
      },
      {
        error: true,
        payload: {
          contentRef: undefined,
          error: new Error("launchKernel needs a kernelSpec and a kernelRef"),
          kernelRef: undefined
        },
        type: "LAUNCH_KERNEL_FAILED"
      }
    ]);
  });

  test("calls launchKernelObservable if given the correct action", async () => {
    const action$ = of(
      actionsModule.launchKernel({
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

    expect(responses[0]).toEqual(
      actionsModule.launchKernelSuccessful({
        kernel: {
          info: null,
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
      })
    );

    expect(responses[1]).toEqual(
      actionsModule.setExecutionState({
        kernelStatus: "launched",
        kernelRef: "123"
      })
    );
  });
});

describe("launchKernelByNameEpic", () => {
  test("creates a LAUNCH_KERNEL action in response to a LAUNCH_KERNEL_BY_NAME action", done => {
    const action$ = of(
      actionsModule.launchKernelByName({
        kernelSpecName: "python3",
        cwd: "~"
      })
    );
    const obs = launchKernelByNameEpic(action$);
    obs.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionsModule.LAUNCH_KERNEL]);
        done();
      },
      err => done.fail(err)
    );
  });
});
