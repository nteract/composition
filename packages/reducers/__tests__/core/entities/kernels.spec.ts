import * as actions from "@nteract/actions";
import { createContentRef, createKernelRef, KernelsRecordProps, KernelStatus, makeKernelsRecord, makeRemoteKernelRecord } from "@nteract/types";
import * as Immutable from "immutable";

import { kernels } from "../../../src/core/entities/kernels";

describe("kernels reducers", () => {
  test("DISPOSE_KERNEL removes the kernel from the client-side model", () => {
    const kernelRef = createKernelRef();
    const originalState = makeKernelsRecord({
      byRef: Immutable.Map({
        [kernelRef]: makeRemoteKernelRecord()
      })
    });
    expect(originalState.byRef.size).toBe(1);
    const action = actions.disposeKernel({ kernelRef });
    const state = kernels(originalState, action) as KernelsRecordProps;
    expect(state.byRef.size).toBe(0);
  });
  test("LAUNCH_KERNEL_SUCCESSFUL throws an error for unknown kernel types", () => {
    const originalState = makeKernelsRecord({
      byRef: Immutable.Map({})
    });
    // @ts-ignore supposed to be wrong
    const action = actions.launchKernelSuccessful({
      kernel: {
        type: "not-expected"
      }
    });
    const invocation = () => kernels(originalState, action);
    expect(invocation).toThrow();
  });
  test("LAUNCH_KERNEL_SUCCESSFUL correctly sets valid kernel types", () => {
    const kernelRef = createKernelRef();
    const contentRef = createContentRef();
    const originalState = makeKernelsRecord({
      byRef: Immutable.Map({})
    });
    const action = actions.launchKernelSuccessful({
      kernel: makeRemoteKernelRecord(),
      kernelRef,
      contentRef,
      selectNextKernel: false
    });
    const state = kernels(originalState, action);
    expect(state.byRef.size).toBe(1);
    expect(state.byRef.getIn([kernelRef, "type"])).toBe("websocket");
  });
  test("KILL_KERNEL_SUCCESSFUL sets kernel state", () => {
    const kernelRef = createKernelRef();
    const originalState = makeKernelsRecord({
      byRef: Immutable.Map({
        [kernelRef]: makeRemoteKernelRecord()
      })
    });
    const action = actions.killKernelSuccessful({ kernelRef });
    const state = kernels(originalState, action) as KernelsRecordProps;
    expect(state.byRef.getIn([kernelRef, "status"])).toBe(KernelStatus.Killed);
  });
  test("KILL_KERNEL_FAILED sets kernel state", () => {
    const kernelRef = createKernelRef();
    const originalState = makeKernelsRecord({
      byRef: Immutable.Map({
        [kernelRef]: makeRemoteKernelRecord()
      })
    });
    const action = actions.killKernelFailed({
      kernelRef,
      error: new Error("test")
    });
    const state = kernels(originalState, action) as KernelsRecordProps;
    expect(state.byRef.getIn([kernelRef, "status"])).toBe(KernelStatus.Error);
  });
  test("SET_EXECUTION_STATE sets kernel status", () => {
    const kernelRef = createKernelRef();
    const originalState = makeKernelsRecord({
      byRef: Immutable.Map({
        [kernelRef]: makeRemoteKernelRecord()
      })
    });
    const action = actions.setExecutionState({
      kernelRef,
      kernelStatus: KernelStatus.Idle
    });
    const state = kernels(originalState, action) as KernelsRecordProps;
    expect(state.byRef.getIn([kernelRef, "status"])).toBe(KernelStatus.Idle);
  });
  test("LAUNCH_KERNEL_BY_NAME sets kernel status", () => {
    const kernelRef = createKernelRef();
    const originalState = makeKernelsRecord({
      byRef: Immutable.Map({
        [kernelRef]: makeRemoteKernelRecord()
      })
    });
    const action = actions.launchKernelByName({
      kernelRef,
      kernelSpecName: "python2",
    });
    const state = kernels(originalState, action) as KernelsRecordProps;
    expect(state.byRef.getIn([kernelRef, "status"])).toBe(KernelStatus.Starting);
  });
  test("LAUNCH_KERNEL_BY_NAME sets kernel status", () => {
    const kernelRef = createKernelRef();
    const originalState = makeKernelsRecord({
      byRef: Immutable.Map({
        [kernelRef]: makeRemoteKernelRecord()
      })
    });
    const action = actions.launchKernelByName({
      kernelRef,
      kernelSpecName: "python2"
    });
    const state = kernels(originalState, action) as KernelsRecordProps;
    expect(state.byRef.getIn([kernelRef, "status"])).toBe(KernelStatus.Starting);
  });
});
