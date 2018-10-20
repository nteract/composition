import {
  actions,
  actionTypes,
  reducers,
  state as stateModule
} from "@nteract/core";

describe("save", () => {
  test("should set isSaving to true", () => {
    const originalState = stateModule.makeAppRecord({
      isSaving: false,
      kernel: stateModule.makeLocalKernelRecord({
        channels: false,
        spawn: false,
        connectionFile: false
      })
    });
    const state = reducers.app(originalState, actions.save({}));
    expect(state.isSaving).toBe(true);
  });
});

describe("saveFailed", () => {
  test("should set isSaving to false", () => {
    const originalState = stateModule.makeAppRecord({
      isSaving: true
    });

    const state = reducers.app(originalState, actions.saveFailed({}));
    expect(state.isSaving).toBe(false);
  });
});

describe("saveFulfilled", () => {
  test("should set isSaving to false", () => {
    const originalState = stateModule.makeAppRecord({
      isSaving: true
    });

    const state = reducers.app(originalState, actions.saveFulfilled({}));
    expect(state.isSaving).toBe(false);
  });
});

describe("setNotificationSystem", () => {
  test("returns the same originalState if notificationSystem is undefined", () => {
    const originalState = stateModule.makeAppRecord();

    const action = { type: actionTypes.SET_NOTIFICATION_SYSTEM };

    const state = reducers.app(originalState, action);
    expect(state.notificationSystem).toEqual(originalState.notificationSystem);
  });
  test("sets the notificationSystem if given", () => {
    const originalState = stateModule.makeAppRecord();

    const action = {
      type: actionTypes.SET_NOTIFICATION_SYSTEM,
      notificationSystem: ""
    };

    const state = reducers.app(originalState, action);
    expect(state.notificationSystem).toBe("");
  });
});

describe("setGithubToken", () => {
  test("calls setGithubToken", () => {
    const originalState = stateModule.makeAppRecord({
      githubToken: null
    });

    const action = { type: actionTypes.SET_GITHUB_TOKEN, githubToken: "TOKEN" };

    const state = reducers.app(originalState, action);
    expect(state.githubToken).toEqual("TOKEN");
  });
});
