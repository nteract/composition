import * as actions from "@nteract/actions";
import { monocellNotebook } from "@nteract/commutable";
import { executeRequest, createMessage } from "@nteract/messaging";
import * as stateModule from "@nteract/types";

import Immutable from "immutable";
import { StateObservable } from "redux-observable";
import { empty, from, Observable, of, Subject } from "rxjs";
import { catchError, share, toArray } from "rxjs/operators";

import {
  createExecuteCellStream,
  executeCellStream,
  sendExecuteRequestEpic
} from "../../src/execute";

describe("executeCellStream", () => {
  test("dispatches actions for updating execution metadata", done => {
    const message = createMessage("execute_request");
    const msg_id = message.header.msg_id;
    const kernelMsgs = [
      {
        parent_header: {
          msg_id
        },
        header: {
          msg_type: "execute_input"
        },
        content: {
          execution_count: 0
        }
      },
      {
        parent_header: {
          msg_id
        },
        header: {
          msg_type: "status"
        },
        content: {
          execution_state: "busy"
        }
      },
      {
        parent_header: {
          msg_id
        },
        header: {
          msg_type: "status"
        },
        content: {
          execution_state: "idle"
        }
      },
      {
        parent_header: {
          msg_id
        },
        header: {
          msg_type: "execute_reply"
        },
        content: {
          execution_count: 1, 
          status: "error",
          ename: "TestException", 
          evalue: "testEvalue", 
          traceback: ["1", "2"]
        }
      }
    ];
    const sent = new Subject();
    const received = new Subject();

    const channels = Subject.create(sent, received);

    sent.subscribe(() => {
      kernelMsgs.map(msg => received.next(msg));
    });

    const obs = executeCellStream(channels, "0", message, "fakeContentRef");

    const emittedActions = [];
    obs.subscribe(action => {
      emittedActions.push(action);
    });

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.setInCell({
          id: "0",
          contentRef: "fakeContentRef",
          path: ["metadata", "execution", "iopub.execute_input"],
          value: expect.any(String)
        })
      )
    );

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.setInCell({
          id: "0",
          contentRef: "fakeContentRef",
          path: ["metadata", "execution", "shell.execute_reply"],
          value: expect.any(String)
        })
      )
    );

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.setInCell({
          id: "0",
          contentRef: "fakeContentRef",
          path: ["metadata", "execution", "iopub.status.idle"],
          value: expect.any(String)
        })
      )
    );

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.setInCell({
          id: "0",
          contentRef: "fakeContentRef",
          path: ["metadata", "execution", "iopub.status.busy"],
          value: expect.any(String)
        })
      )
    );

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.updateCellStatus({
          id: "0",
          contentRef: "fakeContentRef",
          status: "idle"
        })
      )
    );

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.updateCellStatus({
          id: "0",
          contentRef: "fakeContentRef",
          status: "busy"
        })
      )
    );

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.updateCellExecutionResult({
          id: "0",
          contentRef: "fakeContentRef",
          result: "error"
        })
      )
    );

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.updateCellExecutionCount({
          id: "0",
          contentRef: "fakeContentRef",
          value: 1
        })
      )
    );

    expect(emittedActions).toContainEqual(
      expect.objectContaining(
        actions.executeCanceled({
          id: "0",
          contentRef: "fakeContentRef",
          code: "EXEC_CELL_RUNTIME_ERROR",
          error: {
            execution_count: 1, 
            status: "error",
            ename: "TestException", 
            evalue: "testEvalue", 
            traceback: ["1", "2"]
          }
        })
      )
    );
    done();
  });
});

describe("createExecuteCellStream", () => {
  test("does not complete but does push until abort action", done => {
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
                  status: "busy"
                })
              })
            }),
            contents: stateModule.makeContentsRecord({
              byRef: Immutable.Map({
                fakeContentRef: stateModule.makeNotebookContentRecord({
                  model: stateModule.makeDocumentRecord({
                    kernelRef: "fake"
                  })
                })
              })
            })
          })
        }),
        app: {}
      }
    };
    const action$ = from([]);
    const message = executeRequest("source");

    const observable = createExecuteCellStream(
      action$,
      channels,
      message,
      "id",
      "fakeContentRef"
    );
    const actionBuffer = [];
    observable.subscribe(
      x => actionBuffer.push(x),
      err => done.fail(err)
    );
    expect(actionBuffer).toEqual([
      actions.clearOutputs({
        id: "id",
        contentRef: "fakeContentRef"
      }),
      actions.updateCellStatus({
        id: "id",
        status: "queued",
        contentRef: "fakeContentRef"
      })
    ]);
    done();
  });
});

describe("sendExecuteRequestEpic", () => {
  const state = {
    app: {
      kernel: {
        channels: "errorInExecuteCellObservable",
        status: "idle"
      },
      githubToken: "blah"
    }
  };
  const state$ = new StateObservable(new Subject(), state);

  test("Errors on a bad action", done => {
    // Make one hot action
    const badAction$ = of(
      actions.sendExecuteRequest({ id: "id", contentRef: "fakeContentRef" })
    ).pipe(share()) as Observable<any>;
    const responseActions = sendExecuteRequestEpic(badAction$, state$).pipe(
      catchError(error => {
        expect(error.message).toEqual(
          "No CellId provided in ExecuteCell action."
        );
        return empty();
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      (x: actions.ExecuteFailed) => {
        expect(x.type).toEqual(actions.EXECUTE_FAILED);
        done();
      },
      err => done.fail(err)
    );
  });

  test("Errors on an action where source not a string", done => {
    const badAction$ = of(
      actions.sendExecuteRequest({ id: "id", contentRef: "fakeContentRef" })
    ).pipe(share()) as Observable<any>;
    const responseActions = sendExecuteRequestEpic(badAction$, state$).pipe(
      catchError(error => {
        expect(error.message).toEqual("execute cell needs source string");
        return empty();
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      (x: actions.ExecuteFailed) => {
        expect(x.type).toEqual(actions.EXECUTE_FAILED);
        done();
      },
      err => done.fail(err)
    );
  });

  test("Informs about disconnected kernels, allows reconnection", async () => {
    const disconnectedState = {
      app: {},
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
      })
    };
    const disconnectedState$ = new StateObservable(
      new Subject(),
      disconnectedState
    );
    const action$ = of(
      actions.sendExecuteRequest({ id: "first", contentRef: "fakeContentRef" })
    );
    const responses = await sendExecuteRequestEpic(action$, disconnectedState$)
      .pipe(toArray())
      .toPromise();
    expect(responses.map(response => response.type)).toEqual([
      actions.EXECUTE_FAILED
    ]);
  });

  test("throws an error when attempting to execute non-notebook types", done => {
    const state = {
      app: {},
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              fakeContent: stateModule.makeDummyContentRecord()
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
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.sendExecuteRequest({ id: "first", contentRef: "fakeContent" })
    );
    let result = "";
    sendExecuteRequestEpic(action$, state$).subscribe(
      // Every action that goes through should get stuck on an array
      (x: actions.ExecuteFailed) => {
        result = x.payload.error.message;
        done();
      },
      err => done.fail(err)
    );
    expect(result).toContain(
      "Cannot send execute requests from non-notebook files"
    );
  });

  test("throws an error when cell is not found", done => {
    const state = {
      app: {},
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
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.sendExecuteRequest({ id: "first", contentRef: "fakeContent" })
    );
    let result = "";
    sendExecuteRequestEpic(action$, state$).subscribe(
      // Every action that goes through should get stuck on an array
      (x: actions.ExecuteFailed) => {
        result = x.payload.error.message;
        done();
      },
      err => done.fail(err)
    );
    expect(result).toContain("Could not find the cell with the given CellId");
  });
  test("throws an error when cell is not a code cell", done => {
    let notebook = monocellNotebook;
    let cellId: string = monocellNotebook.cellOrder.first();
    notebook = notebook.setIn(["cellMap", cellId, "cell_type"], "markdown");
    const state = {
      app: {},
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              fakeContent: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  notebook
                })
              })
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
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.sendExecuteRequest({ id: cellId, contentRef: "fakeContent" })
    );
    let result = "";
    sendExecuteRequestEpic(action$, state$).subscribe(
      // Every action that goes through should get stuck on an array
      (x: actions.ExecuteCanceled) => {
        result = x.payload.code;
        done();
      },
      err => done.fail(err)
    );
    expect(result).toContain("EXEC_INVALID_CELL_TYPE");
  });

  test("throws an error when cell is empty", done => {
    const notebook = monocellNotebook;
    let cellId: string = monocellNotebook.cellOrder.first();
    const state = {
      app: {},
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              fakeContent: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  notebook
                })
              })
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
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.sendExecuteRequest({ id: cellId, contentRef: "fakeContent" })
    );
    let result = "";
    sendExecuteRequestEpic(action$, state$).subscribe(
      // Every action that goes through should get stuck on an array
      (x: actions.ExecuteCanceled) => {
        result = x.payload.code;
        done();
      },
      err => done.fail(err)
    );
    expect(result).toContain("EXEC_NO_SOURCE_ERROR");
  });

  test("throws an error when kernel is not connected", done => {
    let notebook = monocellNotebook;
    let cellId: string = monocellNotebook.cellOrder.first();
    notebook = notebook.setIn(["cellMap", cellId, "source"], "print('test')");
    const state = {
      app: {},
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              fakeContent: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  notebook
                })
              })
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
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.sendExecuteRequest({ id: cellId, contentRef: "fakeContent" })
    );
    let result = "";
    sendExecuteRequestEpic(action$, state$).subscribe(
      // Every action that goes through should get stuck on an array
      (x: actions.ExecuteFailed) => {
        result = x.payload.error.message;
        done();
      },
      err => done.fail(err)
    );
    expect(result).toContain("There is no connected kernel for this content");
  });

  test("throws an error when kernel channels is malformed", done => {
    let notebook = monocellNotebook;
    let cellId: string = monocellNotebook.cellOrder.first();
    notebook = notebook.setIn(["cellMap", cellId, "source"], "print('test')");
    const state = {
      app: {},
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              fakeContent: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  notebook,
                  kernelRef: "fake"
                })
              })
            })
          }),
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fake: stateModule.makeRemoteKernelRecord({
                channels: null,
                status: "idle"
              })
            })
          })
        })
      })
    };
    const state$ = new StateObservable(new Subject(), state);
    const action$ = of(
      actions.sendExecuteRequest({ id: cellId, contentRef: "fakeContent" })
    );
    let result = "";
    sendExecuteRequestEpic(action$, state$).subscribe(
      // Every action that goes through should get stuck on an array
      (x: actions.ExecuteFailed) => {
        result = x.payload.error.message;
        done();
      },
      err => done.fail(err)
    );
    expect(result).toContain(
      "The WebSocket associated with the target kernel is in a bad state"
    );
  });
});
