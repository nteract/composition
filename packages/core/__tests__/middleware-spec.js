import { errorMiddleware } from "../src/middlewares";

const fakeConsole = {
  error: () => {}
};

describe("The error middleware", () => {
  test("errors with a payload message when given one", () => {
    const store = {
      getState() {
        return this.state;
      },
      dispatch(action) {
        return this.reducer(store, action);
      },
      state: {
        app: {
          get() {
            return this.notificationSystem;
          },
          notificationSystem: { addNotification: jest.fn() }
        }
      },
      reducer: jest.fn()
    };
    const next = action => store.dispatch(action);
    const action = { type: "ERROR", payload: "This is a payload" };

    const notification = store.getState().app.notificationSystem
      .addNotification;
    errorMiddleware(store, fakeConsole)(next)(action);
    expect(notification).toBeCalledWith({
      title: "ERROR",
      message: JSON.stringify("This is a payload", 2, 2),
      dismissible: true,
      position: "tr",
      level: "error"
    });

    expect(store.reducer).toBeCalled();
  });
  test("errors with action as message when no payload", () => {
    const store = {
      getState() {
        return this.state;
      },
      dispatch(action) {
        return this.reducer(store, action);
      },
      state: {
        app: {
          get() {
            return this.notificationSystem;
          },
          notificationSystem: { addNotification: jest.fn() }
        }
      },
      reducer: jest.fn()
    };
    const next = action => store.dispatch(action);
    const action = { type: "ERROR", payloa: "typo" };
    const notification = store.getState().app.notificationSystem
      .addNotification;
    errorMiddleware(store, fakeConsole)(next)(action);
    expect(notification).toBeCalledWith({
      title: "ERROR",
      message: JSON.stringify(action, 2, 2),
      dismissible: true,
      position: "tr",
      level: "error"
    });
    expect(store.reducer).toBeCalled();
  });
  test("treats an action w/ 'error: true' as an error", () => {
    const store = {
      getState() {
        return this.state;
      },
      dispatch(action) {
        return this.reducer(store, action);
      },
      state: {
        app: {
          get() {
            return this.notificationSystem;
          },
          notificationSystem: { addNotification: jest.fn() }
        }
      },
      reducer: jest.fn()
    };
    const next = action => store.dispatch(action);
    const action = {
      type: "BAD_STUFF_ACTION_TYPE",
      payload: "This is a payload",
      error: true
    };
    const notification = store.getState().app.notificationSystem
      .addNotification;
    errorMiddleware(store, fakeConsole)(next)(action);
    expect(notification).toBeCalledWith({
      title: "BAD_STUFF_ACTION_TYPE",
      message: JSON.stringify("This is a payload", 2, 2),
      dismissible: true,
      position: "tr",
      level: "error"
    });
    expect(store.reducer).toBeCalled();
  });
  test("stringifies a nested Error object sensibly", () => {
    const store = {
      getState() {
        return this.state;
      },
      dispatch(action) {
        return this.reducer(store, action);
      },
      state: {
        app: {
          get() {
            return this.notificationSystem;
          },
          notificationSystem: { addNotification: jest.fn() }
        }
      },
      reducer: jest.fn()
    };
    const next = action => store.dispatch(action);
    const action = {
      type: "BAD_STUFF_ACTION_TYPE",
      payload: { error: new Error("JS ERROR") },
      error: true
    };
    const notification = store.getState().app.notificationSystem
      .addNotification;
    errorMiddleware(store, fakeConsole)(next)(action);
    expect(notification).toBeCalledWith({
      title: "BAD_STUFF_ACTION_TYPE",
      message: "JS ERROR",
      dismissible: true,
      position: "tr",
      level: "error"
    });
    expect(store.reducer).toBeCalled();
  });
});
