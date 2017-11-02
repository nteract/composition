import { errorMiddleware } from "../src/middlewares";

const fakeConsole = {
  error: msg => {}
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
    const action = { type: "ERROR", payload: "This is a payload", err: true };

    const fakeConsole = {
      error: msg => {}
    };

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
    const action = { type: "ERROR", payloa: "typo", err: true };
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
});
