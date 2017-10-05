import { dummyStore } from "utils";
import * as globalEvents from "../../src/notebook/global-events";
import * as kernel from "../../src/notebook/kernel/shutdown";

describe("unload", () => {
  test("should force a kernel shutdown", () => {
    const store = dummyStore();
    kernel.forceShutdownKernel = jest.fn();

    globalEvents.unload(store);

    expect(kernel.forceShutdownKernel).toHaveBeenCalled();
  });
});

describe("beforeUnload", () => {
  test("should set event.returnValue if notebook is modified to prevent unload", () => {
    const store = dummyStore();

    const event = {};

    globalEvents.beforeUnload(store, event);

    expect(event.returnValue).toBeDefined();
  });

  test("should should not set event.returnValue if notebook is saved", () => {
    const store = dummyStore({ saved: true });

    const event = {};

    globalEvents.beforeUnload(store, event);

    expect(event.returnValue).toBeUndefined();
  });
});

describe("initGlobalHandlers", () => {
  test("adds an unload poperty to the window object", () => {
    const store = dummyStore();
    globalEvents.initGlobalHandlers(store);
    expect(global.window.onunload).toBeDefined();
    expect(global.window.onbeforeunload).toBeDefined();
  });
});
