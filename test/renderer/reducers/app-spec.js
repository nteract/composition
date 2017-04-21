import { expect } from "chai";

import * as constants from "../../../src/notebook/constants";
import reducers from "../../../src/notebook/reducers";
import { AppRecord } from "../../../src/notebook/records";

const Github = require("github");

describe("cleanupKernel", () => {
  it("nullifies entries for the kernel in originalState", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.KILL_KERNEL
    };

    const state = reducers(originalState, action);
    expect(state.app.channels).to.be.null;
    expect(state.app.spawn).to.be.null;
    expect(state.app.connectionFile).to.be.null;
  });
});

describe("setNotificationSystem", () => {
  it("returns the same originalState if notificationSystem is undefined", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.SET_NOTIFICATION_SYSTEM
    };

    const state = reducers(originalState, action);
    expect(state.app.notificationSystem).to.be.undefined;
  });
  it("sets the notificationSystem if given", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.SET_NOTIFICATION_SYSTEM,
      notificationSystem: ""
    };

    const state = reducers(originalState, action);
    expect(state.app.notificationSystem).to.equal("");
  });
});

describe("startSaving", () => {
  it("should set isSaving to false", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.START_SAVING
    };

    const state = reducers(originalState, action);
    expect(state.app.isSaving).to.be.true;
  });
});

describe("doneSaving", () => {
  it("should set isSaving to false", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.DONE_SAVING
    };

    const state = reducers(originalState, action);
    expect(state.app.isSaving).to.be.false;
  });
});

describe("setExecutionState", () => {
  it("should set the exeuction state to the given value", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.SET_EXECUTION_STATE,
      executionState: "idle"
    };

    const state = reducers(originalState, action);
    expect(state.app.executionState, "idle");
  });
});

describe("alertKernelNotConnected", () => {
  it("sets an error on the app state", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.ERROR_KERNEL_NOT_CONNECTED
    };

    const state = reducers(originalState, action);
    expect(state.app.error).to.not.be.null;
    expect(state.app.error).to.contain("not connected to a runtime");
  });
});

describe("killKernel", () => {
  it("clears out kernel configuration", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.KILL_KERNEL
    };

    const state = reducers(originalState, action);
    expect(state.app.channels).to.be.null;
    expect(state.app.spawn).to.be.null;
    expect(state.app.connectionFile).to.be.null;
  });
});

describe("interruptKernel", () => {
  it("sends a SIGINT and clears the kernel", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: {
          kill: () => {}
        },
        connectionFile: false
      })
    };

    const action = {
      type: constants.INTERRUPT_KERNEL
    };

    const state = reducers(originalState, action);
    expect(state.app).to.deep.equal(originalState.app);
  });
});

describe("newKernel", () => {
  it("creates a new kernel", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.NEW_KERNEL,
      channels: "test_channels",
      spawn: "test_spawn",
      kernelSpecName: "test_name",
      kernelSpec: { spec: { display_name: "Test Name" } },
      executionState: "starting"
    };

    const state = reducers(originalState, action);
    expect(state.app.executionState).to.equal("starting");
    expect(state.app.kernelSpecName).to.equal("test_name");
    expect(state.app.kernelSpec).to.deep.equal({
      spec: { display_name: "Test Name" }
    });
    expect(state.app.kernelSpecDisplayName).to.equal("Test Name");
    expect(state.app.spawn).to.equal("test_spawn");
    expect(state.app.channels).to.equal("test_channels");
  });
});

describe("setGithubToken", () => {
  it("calls setGithubToken", () => {
    const originalState = {
      app: new AppRecord({
        github: new Github(),
        token: null
      })
    };

    const action = {
      type: constants.SET_GITHUB_TOKEN,
      token: "TOKEN"
    };

    const state = reducers(originalState, action);
    // this is a crappy way of testing this
    expect(state.app.github).to.not.be.null;
    expect(state.app.token).to.not.be.null;
  });
});

describe("exit", () => {
  it("calls cleanupKernel", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = {
      type: constants.EXIT
    };

    const state = reducers(originalState, action);
    expect(state.app.channels).to.be.null;
    expect(state.app.spawn).to.be.null;
    expect(state.app.connectionFile).to.be.null;
    expect(state.app.kernelSpecName).to.be.null;
    expect(state.app.executionState).to.equal("not connected");
  });
});

describe("doneSavingConfig", () => {
  it("updates when the config was saved", () => {
    const originalState = {
      app: new AppRecord({
        configLastSaved: null
      })
    };

    const action = {
      type: constants.DONE_SAVING_CONFIG
    };

    const state = reducers(originalState, action);
    expect(state.app.configLastSaved).to.be.a("Date");
  });
});
