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

describe("initGlobalHandlers", () => {
  it("adds an unload poperty to the window object", () => {
    const store = dummyStore();
    globalEvents.initGlobalHandlers(store);
    expect(global.window.onunload).to.not.be.undefined;
  });
});
