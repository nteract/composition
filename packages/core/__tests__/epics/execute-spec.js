// @flow
import { ActionsObservable } from "redux-observable";
import {
  SEND_EXECUTE_REQUEST,
  ABORT_EXECUTION,
  ERROR_EXECUTING,
  CLEAR_OUTPUTS,
  UPDATE_CELL_STATUS,
  UPDATE_DISPLAY,
  ACTIVATE_KERNEL
} from "@nteract/core/constants";

import { createExecuteRequest } from "@nteract/messaging";

import { executeCell } from "@nteract/core/actions";
import {
  executeCellStream,
  executeCellEpic,
  updateDisplayEpic,
  createExecuteCellStream
} from "../../src/epics/execute";

const Immutable = require("immutable");

import { Subject } from "rxjs/Subject";
import { from } from "rxjs/observable/from";
import { toArray, share, catchError, bufferCount } from "rxjs/operators";

describe("executeCell", () => {
  test("returns an executeCell action", () => {
    expect(executeCell("0-0-0-0", "import random; random.random()")).toEqual({
      type: SEND_EXECUTE_REQUEST,
      id: "0-0-0-0",
      message: expect.any(Object)
    });
  });
});

describe("executeCellStream", () => {
  test("outright rejects a lack of channels.shell and iopub", done => {
    const obs = executeCellStream({}, "0", {});
    obs.subscribe(null, err => {
      expect(err.message).toEqual("kernel not connected");
      done();
    });
  });
});

describe("createExecuteCellStream", () => {
  test("errors if the kernel is not connected in create", done => {
    const frontendToShell = new Subject();
    const shellToFrontend = new Subject();
    const mockShell = Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Subject();
    const channels = mockShell;
    const store = {
      getState() {
        return this.state;
      },
      state: {
        app: {
          executionState: "not connected",
          kernel: {
            channels
          },
          notificationSystem: { addNotification: jest.fn() }
        }
      }
    };
    const action$ = ActionsObservable.of({ type: SEND_EXECUTE_REQUEST });
    const observable = createExecuteCellStream(action$, store, "source", "id");
    observable.pipe(toArray()).subscribe(
      actions => {
        const payloads = actions.map(({ payload }) => payload);
        expect(payloads).toEqual(["Kernel not connected!"]);
        done();
      },
      err => done.fail(err)
    );
  });
  test("doesnt complete but does push until abort action", done => {
    const frontendToShell = new Subject();
    const shellToFrontend = new Subject();
    const mockShell = Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Subject();

    const channels = mockShell;
    const store = {
      getState() {
        return this.state;
      },
      state: {
        app: {
          executionState: "connected",
          kernel: {
            channels
          },
          notificationSystem: { addNotification: jest.fn() }
        }
      }
    };
    const action$ = ActionsObservable.of(
      {
        type: SEND_EXECUTE_REQUEST,
        id: "id",
        message: createExecuteRequest("this")
      },
      {
        type: SEND_EXECUTE_REQUEST,
        id: "id_2",
        message: createExecuteRequest("is")
      },
      { type: ABORT_EXECUTION, id: "id_2" },
      {
        type: SEND_EXECUTE_REQUEST,
        id: "id",
        message: createExecuteRequest("kind of")
      }
    );
    const observable = createExecuteCellStream(
      action$,
      store,
      createExecuteRequest("source"),
      "id"
    );
    const actionBuffer = [];
    observable.subscribe(x => actionBuffer.push(x.type), err => done.fail(err));
    expect(actionBuffer).toEqual([]);
    done();
  });
});

describe("executeCellEpic", () => {
  const store = {
    getState() {
      return this.state;
    },
    state: {
      app: {
        executionState: "idle",
        kernel: {
          channels: "errorInExecuteCellObservable"
        },
        notificationSystem: { addNotification: jest.fn() },
        githubToken: "blah"
      }
    }
  };
  test("Errors on a bad action", done => {
    // Make one hot action
    const badAction$ = ActionsObservable.of({
      type: SEND_EXECUTE_REQUEST
    }).pipe(share());
    const responseActions = executeCellEpic(badAction$, store).pipe(
      catchError(error => {
        expect(error.message).toEqual("execute cell needs an id");
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => {
        expect(x.type).toEqual(ERROR_EXECUTING);
        done();
      },
      err => done.fail(err)
    );
  });
  test("Errors on an action where source not a string", done => {
    const badAction$ = ActionsObservable.of(executeCell("id", 2)).pipe(share());
    const responseActions = executeCellEpic(badAction$, store).pipe(
      catchError(error => {
        expect(error.message).toEqual("execute cell needs source string");
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => {
        expect(x.type).toEqual(ERROR_EXECUTING);
        done();
      },
      err => done.fail(err)
    );
  });
  test("Informs about disconnected kernels, allows reconnection", done => {
    const action$ = ActionsObservable.of(executeCell("id", "source")).pipe(
      share()
    );
    const responseActions = executeCellEpic(action$, store);
    responseActions.subscribe(
      x => {
        expect(x.payload.toString()).toEqual("Error: kernel not connected");
        done();
      },
      err => done.fail(err)
    );
  });
});

describe("updateDisplayEpic", () => {
  test("creates an epic that handles update_display_data messages", done => {
    const messages = [
      // Should be processed
      {
        header: { msg_type: "update_display_data" },
        content: {
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "1234" }
        }
      },
      {
        header: { msg_type: "display_data" },
        content: {
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "5555" }
        }
      },
      // Should not be processed
      {
        header: { msg_type: "ignored" },
        content: { data: { "text/html": "<marquee>wee</marquee>" } }
      },
      {
        header: { msg_type: "update_display_data" },
        content: {
          data: { "text/plain": "i am text" },
          transient: { display_id: "here" }
        }
      }
    ];

    const channels = from(messages);
    const action$ = ActionsObservable.of({ type: ACTIVATE_KERNEL, channels });

    const epic = updateDisplayEpic(action$);

    const responseActions = [];
    epic.subscribe(
      action => responseActions.push(action),
      err => {
        throw err;
      },
      () => {
        expect(responseActions).toEqual([
          {
            type: UPDATE_DISPLAY,
            output: {
              output_type: "display_data",
              data: { "text/html": "<marquee>wee</marquee>" },
              transient: { display_id: "1234" }
            }
          },
          {
            type: UPDATE_DISPLAY,
            output: {
              output_type: "display_data",
              data: { "text/plain": "i am text" },
              transient: { display_id: "here" }
            }
          }
        ]);
        done();
      }
    );
  });
});
