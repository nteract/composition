import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { dummyStore } from "../utils";
import * as globalEvents from "../../src/notebook/global-events";
import * as kernel from "../../src/notebook/kernel/shutdown";

chai.use(sinonChai);

describe("unload", () => {
  it("should force a kernel shutdown", () => {
    const store = dummyStore();
    const forceShutdownKernel = sinon.spy(kernel, "forceShutdownKernel");

    globalEvents.unload(store);

    forceShutdownKernel.restore();
    expect(forceShutdownKernel).to.be.called;
  });
});

describe("beforeUnload", () => {
  it("should set event.returnValue if notebook is modified to prevent unload", () => {
    const store = dummyStore();

    const event = {};

    globalEvents.beforeUnload(store, event);

    expect(event.returnValue).to.not.be.undefined;
  });

  it("should should not set event.returnValue if notebook is saved", () => {
    const store = dummyStore({ saved: true });

    const event = {};

    globalEvents.beforeUnload(store, event);

    expect(event.returnValue).to.be.undefined;
  });
});

describe("initGlobalHandlers", () => {
  it("adds an unload poperty to the window object", () => {
    const store = dummyStore();
    globalEvents.initGlobalHandlers(store);
    expect(global.window.onunload).to.not.be.undefined;
    expect(global.window.onbeforeunload).to.not.be.undefined;
  });
});
