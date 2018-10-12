// @flow strict
import { makeKernelsRecord } from "../../../../src/state/entities/kernels";
import { kernels } from "../../../../src/reducers/core/entities/kernels";
import { actions } from "@nteract/core";

describe("LAUNCH_KERNEL reducers", () => {
  test("set launching state", () => {
    const originalState = makeKernelsRecord();

    const action = actions.launchKernel({
      kernelSpec: "kernelSpec",
      kernelType: "zeromq",
      cwd: ".",
      kernelRef: "kernelRef",
      selectNextKernel: false,
      contentRef: "contentRef"
    });

    const state = kernels(originalState, action);

    expect(state.byRef.get("kernelRef").type).toBe("zeromq");
    expect(state.byRef.get("kernelRef").status).toBe("launching");
  });
});
