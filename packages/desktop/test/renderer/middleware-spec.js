import sinon from "sinon";
import sinonChai from "sinon-chai";

import { errorMiddleware } from "../../src/notebook/middlewares";

const chai = require("chai");

const expect = chai.expect;
chai.use(sinonChai);

describe("The error middleware", () => {
  it("errors with a payload message when given one", () => {
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
          notificationSystem: {
            addNotification: sinon.spy()
          }
        }
      },
      reducer: sinon.spy()
    };
    const next = action => store.dispatch(action);
    const action = { type: "ERROR", payload: "This is a payload", err: true };
    const notification = store.getState().app.notificationSystem
      .addNotification;
    errorMiddleware(store)(next)(action);
    expect(notification).to.be.calledWith({
      title: "ERROR",
      message: JSON.stringify("This is a payload", 2, 2),
      dismissible: true,
      position: "tr",
      level: "error"
    });

    expect(store.reducer).to.be.called;
  });
  it("errors with action as message when no payload", () => {
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
          notificationSystem: {
            addNotification: sinon.spy()
          }
        }
      },
      reducer: sinon.spy()
    };
    const next = action => store.dispatch(action);
    const action = { type: "ERROR", payloa: "typo", err: true };
    const notification = store.getState().app.notificationSystem
      .addNotification;
    errorMiddleware(store)(next)(action);
    expect(notification).to.be.calledWith({
      title: "ERROR",
      message: JSON.stringify(action, 2, 2),
      dismissible: true,
      position: "tr",
      level: "error"
    });
    expect(store.reducer).to.be.called;
  });
});
