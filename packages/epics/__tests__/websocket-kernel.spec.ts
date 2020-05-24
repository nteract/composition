import * as Immutable from "immutable";
import { StateObservable } from "redux-observable";
import { Subject, of } from "rxjs";
import { toArray } from "rxjs/operators";

import * as actions from "@nteract/actions";
import * as stateModule from "@nteract/types";
import { mockAppState } from "@nteract/fixtures";
import * as coreEpics from "../src";

jest.mock("rx-jupyter", () => ({
  sessions: {
    update: (severConfig, sessionid, sessionPayload) => {
      return of({ response: { kernel: { id: "test" } } });
    },
    create: (serverConfig, sessionPayload) => {
      return of({ response: { id: "test", kernel: { id: "test" } } });
    },
    destroy: (serverConfig, sessionId) => {
      return of({ response: {} });
    }
  },
  kernels: {
    start: (serverConfig, kernelSpecName, cwd) => {
      return of({ response: { id: "test", kernel: { id: "test" } } });
    },
    restart: (serverConfig, id) => {
      return of({ status: 200, response: {} });
    },
    interrupt: (serverConfig, id) => {
      return of({ response: {} });
    },
    connect: (serverConfig, kernelId, sessionId) => {
      return new Subject();
    }
  }
}));

describe("launchWebSocketKernelEpic", () => {
  test("launches remote kernels", async () => {
    const contentRef = "fakeContentRef";
    const kernelRef = "fake";
    const hostRef = "fakeHostRef";
    const closeObserver = { next: () => {} }
    const value = {
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({
          type: "jupyter",
          token: "eh",
          basePath: "http://localhost:8888/",
          closeObserver
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({}),
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              fakeContentRef: stateModule.makeNotebookContentRecord()
            })
          }),
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fake: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          }),
          hosts: stateModule.makeHostsRecord({
            byRef: Immutable.Map({
              [hostRef]: stateModule.makeJupyterHostRecord({
                type: "jupyter",
                token: "eh",
                basePath: "http://localhost:8888/",
                closeObserver
              })
            })
          })
        })
      })
    };
    const state$ = new StateObservable(
      new Subject<stateModule.AppState>(),
      value
    );
    const action$ = of(
      actions.launchKernelByName({
        contentRef,
        kernelRef,
        kernelSpecName: "fancy",
        cwd: "/",
        selectNextKernel: true
      })
    );

    const responseActions = await coreEpics
      .launchWebSocketKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: "LAUNCH_KERNEL_SUCCESSFUL",
        payload: {
          contentRef,
          kernelRef,
          selectNextKernel: true,
          kernel: {
            info: null,
            sessionId: "test",
            hostRef,
            type: "websocket",
            channels: expect.any(Subject),
            kernelSpecName: "fancy",
            cwd: "/",
            id: "test",
            status: undefined
          }
        }
      }
    ]);
  });
});

describe("interruptKernelEpic", () => {
  test("can interrupt a kernel when given a kernel ref", async () => {
    const state$ = new StateObservable(new Subject<stateModule.AppState>(), {
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fake: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({
          type: "jupyter",
          token: "eh",
          basePath: "http://localhost:8888/"
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    });
    const action$ = of(
      actions.interruptKernel({ kernelRef: "fake" })
    );

    const responseActions = await coreEpics
      .interruptKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: "INTERRUPT_KERNEL_SUCCESSFUL",
        payload: { kernelRef: "fake" }
      }
    ]);
  });
  test("can interrupt a kernel when given a content ref", async () => {
    const state$ = new StateObservable(new Subject<stateModule.AppState>(), {
      core: stateModule.makeStateRecord({
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fakeKernelRef: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "fakeKernelRef"
                })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({
          type: "jupyter",
          token: "eh",
          basePath: "http://localhost:8888/"
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    });
    const action$ = of(
      actions.interruptKernel({ contentRef: "contentRef" })
    );

    const responseActions = await coreEpics
      .interruptKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: "INTERRUPT_KERNEL_SUCCESSFUL",
        payload: { kernelRef: undefined, contentRef: "contentRef" }
      }
    ]);
  });
});

describe("restartKernelEpic", () => {
  test("does not execute restart if no kernelRef is passed", async () => {
    const state$ = new StateObservable(new Subject<stateModule.AppState>(), {
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fake: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({
          type: "jupyter",
          token: "eh",
          basePath: "http://localhost:8888/"
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    });
    const action$ = of(
      actions.restartKernel({
        kernelRef: null,
        contentRef: "contentRef",
        outputHandling: "None"
      })
    );

    const responseActions = await coreEpics
      .restartWebSocketKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: actions.RESTART_KERNEL_FAILED,
        error: true,
        payload: {
          error: new Error("Can't execute restart without kernel ref."),
          kernelRef: "none provided",
          contentRef: "contentRef"
        }
      }
    ]);
  });
  test("does not execute restart if host type is not Jupyter", async () => {
    const state$ = new StateObservable(new Subject<stateModule.AppState>(), {
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fake: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        host: stateModule.makeLocalHostRecord({
          type: "local"
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    });
    const action$ = of(
      actions.restartKernel({
        kernelRef: "fake",
        contentRef: "contentRef",
        outputHandling: "None"
      })
    );

    const responseActions = await coreEpics
      .restartWebSocketKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: actions.RESTART_KERNEL_FAILED,
        error: true,
        payload: {
          error: new Error("Can't restart a kernel with no Jupyter host."),
          kernelRef: "fake",
          contentRef: "contentRef"
        }
      }
    ]);
  });
  test("does not execute restart if no kernel exists with kernelRef", async () => {
    const state$ = new StateObservable(new Subject<stateModule.AppState>(), {
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              notFake: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({
          type: "jupyter",
          token: "eh",
          basePath: "http://localhost:8888/"
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    });
    const action$ = of(
      actions.restartKernel({
        kernelRef: "fake",
        contentRef: "contentRef",
        outputHandling: "None"
      })
    );

    const responseActions = await coreEpics
      .restartWebSocketKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: actions.RESTART_KERNEL_FAILED,
        error: true,
        payload: {
          error: new Error("Can't restart a kernel that does not exist."),
          kernelRef: "fake",
          contentRef: "contentRef"
        }
      }
    ]);
  });
  test("restarts kernel if given valid kernel ref", async () => {
    const state$ = new StateObservable(new Subject<stateModule.AppState>(), {
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fake: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({
          type: "jupyter",
          token: "eh",
          basePath: "http://localhost:8888/"
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    });
    const action$ = of(
      actions.restartKernel({
        kernelRef: "fake",
        contentRef: "contentRef",
        outputHandling: "None"
      })
    );

    const responseActions = await coreEpics
      .restartWebSocketKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: actions.RESTART_KERNEL_SUCCESSFUL,
        payload: {
          kernelRef: "fake",
          contentRef: "contentRef"
        }
      }
    ]);
  });
  test("respects output handling for running all cells", async () => {
    const state$ = new StateObservable(new Subject<stateModule.AppState>(), {
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fake: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({
          type: "jupyter",
          token: "eh",
          basePath: "http://localhost:8888/"
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    });
    const action$ = of(
      actions.restartKernel({
        kernelRef: "fake",
        contentRef: "contentRef",
        outputHandling: "Run All"
      })
    );

    const responseActions = await coreEpics
      .restartWebSocketKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: actions.RESTART_KERNEL_SUCCESSFUL,
        payload: {
          kernelRef: "fake",
          contentRef: "contentRef"
        }
      },
      {
        type: actions.EXECUTE_ALL_CELLS,
        payload: {
          contentRef: "contentRef"
        }
      }
    ]);
  });
  test("respects output handling for clearing all cells", async () => {
    const state$ = new StateObservable(new Subject<stateModule.AppState>(), {
      core: stateModule.makeStateRecord({
        kernelRef: "fake",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              fake: stateModule.makeRemoteKernelRecord({
                type: "websocket",
                channels: new Subject<any>(),
                kernelSpecName: "fancy",
                id: "0"
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({
          type: "jupyter",
          token: "eh",
          basePath: "http://localhost:8888/"
        }),
      }),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    });
    const action$ = of(
      actions.restartKernel({
        kernelRef: "fake",
        contentRef: "contentRef",
        outputHandling: "Clear All"
      })
    );

    const responseActions = await coreEpics
      .restartWebSocketKernelEpic(action$, state$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        type: actions.RESTART_KERNEL_SUCCESSFUL,
        payload: {
          kernelRef: "fake",
          contentRef: "contentRef"
        }
      },
      {
        type: actions.CLEAR_ALL_OUTPUTS,
        payload: {
          contentRef: "contentRef"
        }
      }
    ]);
  });
});

describe("changeWebSocketKernelEpic", () => {
  it("does nothing if the current host is not a Jupyter server", done => {
    const state = mockAppState({});
    const kernelRef: string = state.core.entities.kernels.byRef
      .keySeq()
      .first();
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = of(
      actions.changeKernelByName({
        kernelSpecName: "julia",
        contentRef,
        oldKernelRef: kernelRef
      })
    );
    const state$ = new StateObservable<stateModule.AppState>(
      new Subject(),
      state
    );
    const obs = coreEpics.changeWebSocketKernelEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
  it("launches a new kernel when given valid details", done => {
    const state = {
      ...mockAppState({}),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({})
      })
    };
    const kernelRef: string = state.core.entities.kernels.byRef
      .keySeq()
      .first();
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = of(
      actions.changeKernelByName({
        kernelSpecName: "julia",
        contentRef,
        oldKernelRef: kernelRef
      })
    );
    const state$ = new StateObservable<stateModule.AppState>(
      new Subject(),
      state
    );
    const obs = coreEpics.changeWebSocketKernelEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.LAUNCH_KERNEL_SUCCESSFUL]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});

describe("killKernelEpic", () => {
  it("it does nothing if the target host is not a Jupyter server", done => {
    const state = {
      ...mockAppState({}),
      app: stateModule.makeAppRecord({
        host: stateModule.makeLocalHostRecord({})
      })
    };
    const kernelRef: string = state.core.entities.kernels.byRef
      .keySeq()
      .first();
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = of(
      actions.killKernel({
        contentRef,
        kernelRef
      })
    );
    const state$ = new StateObservable<stateModule.AppState>(
      new Subject(),
      state
    );
    const obs = coreEpics.killKernelEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([]);
      },
      err => done.fail(err),
      () => done()
    );
  });
  it("raises an error if there is no kernel for the content ref", done => {
    const state = {
      ...mockAppState({}),
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({})
      })
    };
    const action$ = of(
      actions.killKernel({
        contentRef: "none",
        kernelRef: "none"
      })
    );
    const state$ = new StateObservable<stateModule.AppState>(
      new Subject(),
      state
    );
    const obs = coreEpics.killKernelEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.KILL_KERNEL_FAILED]);
      },
      err => done.fail(err),
      () => done()
    );
  });
  it("successfully kills a websocket kernel with valid details", done => {
    const state = {
      app: stateModule.makeAppRecord({
        host: stateModule.makeJupyterHostRecord({})
      }),
      core: stateModule.makeStateRecord({
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              aKernel: stateModule.makeRemoteKernelRecord({
                id: "test",
                sessionId: "test"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              aContent: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({ kernelRef: "aKernel" })
              })
            })
          })
        })
      })
    };
    const action$ = of(
      actions.killKernel({
        contentRef: "aContent",
        kernelRef: "aKernel"
      })
    );
    const state$ = new StateObservable<stateModule.AppState>(
      new Subject(),
      state
    );
    const obs = coreEpics.killKernelEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        console.log(action);
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.KILL_KERNEL_SUCCESSFUL]);
      },
      err => done.fail(err),
      () => done()
    );
  });
});
