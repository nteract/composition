// @flow
import { ActionsObservable } from "redux-observable";
import { actionTypes, actions, state as stateModule } from "@nteract/core";
import { createExecuteRequest } from "@nteract/messaging";
import { Subject, from } from "rxjs";
import { toArray, share, catchError } from "rxjs/operators";

import {
  executeCellStream,
  executeCellEpic,
  updateDisplayEpic,
  createExecuteCellStream
} from "../../src/epics/execute";

const Immutable = require("immutable");


describe("executeCell", () => {
  test("returns an executeCell action", () => {
    expect(actions.executeCell({ id: "0-0-0-0" })).toEqual({
      type: actionTypes.EXECUTE_CELL,
      payload: { id: "0-0-0-0" }
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
    const channels = mockShell;
    const state$ = {
      value: {
        core: stateModule.makeStateRecord({
          kernelRef: "fake",
          entities: stateModule.makeEntitiesRecord({
            kernels: stateModule.makeKernelsRecord({
              byRef: Immutable.Map({
                fake: stateModule.makeRemoteKernelRecord({
                  channels,
                  status: "not connected"
                })
              })
            })
          })
        }),
        app: {
          notificationSystem: { addNotification: jest.fn() }
        }
      }
    };
    const action$ = ActionsObservable.of(actions.sendExecuteRequest({}));
    const observable = createExecuteCellStream(
      action$,
      state$.value,
      "source",
      "id"
    );
    observable.pipe(toArray()).subscribe(
      actions => {
        const errors = actions.map(({ payload: { error } }) =>
          error.toString()
        );
        expect(errors).toEqual(["Error: Kernel not connected!"]);
        done();
      },
      err => done.fail(err)
    );
  });
  test("doesnt complete but does push until abort action", done => {
    const frontendToShell = new Subject();
    const shellToFrontend = new Subject();
    const mockShell = Subject.create(frontendToShell, shellToFrontend);

    const channels = mockShell;
    const state$ = {
      value: {
        core: stateModule.makeStateRecord({
          kernelRef: "fake",
          entities: stateModule.makeEntitiesRecord({
            kernels: stateModule.makeKernelsRecord({
              byRef: Immutable.Map({
                fake: stateModule.makeRemoteKernelRecord({
                  channels,
                  status: "connected"
                })
              })
            })
          })
        }),
        app: {
          notificationSystem: { addNotification: jest.fn() }
        }
      }
    };
    const action$ = ActionsObservable.from([]);
    const message = createExecuteRequest("source");

    const observable = createExecuteCellStream(
      action$,
      state$.value,
      message,
      "id"
    );
    const actionBuffer = [];
    observable.subscribe(x => actionBuffer.push(x), err => done.fail(err));
    expect(actionBuffer).toEqual([
      actions.sendExecuteRequest({ id: "id", message })
    ]);
    done();
  });
});

describe("executeCellEpic", () => {
  const state$ = {
    value: {
      app: {
        kernel: {
          channels: "errorInExecuteCellObservable",
          status: "idle"
        },
        notificationSystem: { addNotification: jest.fn() },
        githubToken: "blah"
      }
    }
  };
  test("Errors on a bad action", done => {
    // Make one hot action
    const badAction$ = ActionsObservable.of(actions.executeCell({})).pipe(
      share()
    );
    const responseActions = executeCellEpic(badAction$, state$).pipe(
      catchError(error => {
        expect(error.message).toEqual("execute cell needs an id");
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => {
        expect(x.type).toEqual(actionTypes.EXECUTE_FAILED);
        done();
      },
      err => done.fail(err)
    );
  });
  test("Errors on an action where source not a string", done => {
    const badAction$ = ActionsObservable.of(
      actions.executeCell({ id: "id" })
    ).pipe(share());
    const responseActions = executeCellEpic(badAction$, state$).pipe(
      catchError(error => {
        expect(error.message).toEqual("execute cell needs source string");
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => {
        expect(x.type).toEqual(actionTypes.EXECUTE_FAILED);
        done();
      },
      err => done.fail(err)
    );
  });
  test("Informs about disconnected kernels, allows reconnection", async function() {
    const state$ = {
      value: {
        core: stateModule.makeStateRecord({
          kernelRef: "fake",
          entities: stateModule.makeEntitiesRecord({
            contents: stateModule.makeContentsRecord({
              byRef: Immutable.Map({
                fakeContent: stateModule.makeNotebookContentRecord()
              })
            }),
            kernels: stateModule.makeKernelsRecord({
              byRef: Immutable.Map({
                fake: stateModule.makeRemoteKernelRecord({
                  channels: null,
                  status: "not connected"
                })
              })
            })
          })
        }),
        app: {
          notificationSystem: { addNotification: jest.fn() }
        }
      }
    };
    const action$ = ActionsObservable.of(actions.executeCell({ id: "first" }));
    const responses = await executeCellEpic(action$, state$)
      .pipe(toArray())
      .toPromise();
    expect(responses).toEqual([]);
  });
});

describe("updateDisplayEpic", () => {
  test("handles update_display_data messages", done => {
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
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL_SUCCESSFUL,
      payload: {
        kernel: {
          channels
        }
      }
    });

    const epic = updateDisplayEpic(action$);

    const responseActions = [];
    epic.subscribe(
      action => responseActions.push(action),
      err => {
        throw err;
      },
      () => {
        expect(responseActions).toEqual([
          actions.updateDisplay({
            content: {
              data: { "text/html": "<marquee>wee</marquee>" },
              transient: { display_id: "1234" }
            }
          }),
          actions.updateDisplay({
            content: {
              data: { "text/plain": "i am text" },
              transient: { display_id: "here" }
            }
          })
        ]);
        done();
      }
    );
  });
});
