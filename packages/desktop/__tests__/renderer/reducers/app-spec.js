import * as constants from "@nteract/core/constants";
import reducers from "../../../src/notebook/reducers";
import { AppRecord } from "../../../src/notebook/records";

const Github = require("github");

describe("cleanupKernel", () => {
  test("nullifies entries for the kernel in originalState", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = { type: constants.KILL_KERNEL };

    const state = reducers(originalState, action);
    expect(state.app.channels).toBeNull();
    expect(state.app.spawn).toBeNull();
    expect(state.app.connectionFile).toBeNull();
  });
});

describe("setNotificationSystem", () => {
  test("returns the same originalState if notificationSystem is undefined", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = { type: constants.SET_NOTIFICATION_SYSTEM };

    const state = reducers(originalState, action);
    expect(state.app.notificationSystem).toBeUndefined();
  });
  test("sets the notificationSystem if given", () => {
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
    expect(state.app.notificationSystem).toBe("");
  });
});

describe("startSaving", () => {
  test("should set isSaving to false", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = { type: constants.START_SAVING };

    const state = reducers(originalState, action);
    expect(state.app.isSaving).toBe(true);
  });
});

describe("doneSaving", () => {
  test("should set isSaving to false", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = { type: constants.DONE_SAVING };

    const state = reducers(originalState, action);
    expect(state.app.isSaving).toBe(false);
  });
});

describe("setExecutionState", () => {
  test("should set the exeuction state to the given value", () => {
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
    expect(state.app.executionState).toBe("idle");
  });
});

describe("alertKernelNotConnected", () => {
  test("sets an error on the app state", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = { type: constants.ERROR_KERNEL_NOT_CONNECTED };

    const state = reducers(originalState, action);
    expect(state.app.error).not.toBeNull();
    expect(state.app.error).toContain("not connected to a runtime");
  });
});

describe("killKernel", () => {
  test("clears out kernel configuration", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = { type: constants.KILL_KERNEL };

    const state = reducers(originalState, action);
    expect(state.app.channels).toBeNull();
    expect(state.app.spawn).toBeNull();
    expect(state.app.connectionFile).toBeNull();
  });
});

describe("interruptKernel", () => {
  test("sends a SIGINT and clears the kernel", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: {
          kill: () => {}
        },
        connectionFile: false
      })
    };

    const action = { type: constants.INTERRUPT_KERNEL };

    const state = reducers(originalState, action);
    expect(state.app).toEqual(originalState.app);
  });
});

describe("newKernel", () => {
  test("creates a new kernel", () => {
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
    expect(state.app.executionState).toBe("starting");
    expect(state.app.kernelSpecName).toBe("test_name");
    expect(state.app.kernelSpec).toEqual({
      spec: { display_name: "Test Name" }
    });
    expect(state.app.kernelSpecDisplayName).toBe("Test Name");
    expect(state.app.spawn).toBe("test_spawn");
    expect(state.app.channels).toBe("test_channels");
  });
});

describe("setGithubToken", () => {
  test("calls setGithubToken", () => {
    const originalState = {
      app: new AppRecord({
        github: new Github(),
        token: null
      })
    };

    const action = { type: constants.SET_GITHUB_TOKEN, token: "TOKEN" };

    const state = reducers(originalState, action);
    // this is a crappy way of testing this
    expect(state.app.github).not.toBeNull();
    expect(state.app.token).not.toBeNull();
  });
});

describe("exit", () => {
  test("calls cleanupKernel", () => {
    const originalState = {
      app: new AppRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    };

    const action = { type: constants.EXIT };

    const state = reducers(originalState, action);
    expect(state.app.channels).toBeNull();
    expect(state.app.spawn).toBeNull();
    expect(state.app.connectionFile).toBeNull();
    expect(state.app.kernelSpecName).toBeNull();
    expect(state.app.executionState).toBe("not connected");
  });
});

describe("doneSavingConfig", () => {
  test("updates when the config was saved", () => {
    const originalState = { app: new AppRecord({ configLastSaved: null }) };

    const action = { type: constants.DONE_SAVING_CONFIG };

    const state = reducers(originalState, action);
    expect(state.app.configLastSaved).toEqual(expect.any(Date));
  });
});
