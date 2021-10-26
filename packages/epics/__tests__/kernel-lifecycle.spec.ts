import { actions as actionsModule, state as stateModule } from "@nteract/core";
import { mockAppState } from "@nteract/fixtures";
import { createMessage, JupyterMessage, MessageType } from "@nteract/messaging";
import { sendNotification } from "@nteract/mythic-notifications";
import * as Immutable from "immutable";
import { StateObservable } from "redux-observable";
import { of, Subject } from "rxjs";
import { toArray } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";

import {
  acquireKernelInfo,
  launchKernelWhenNotebookSetEpic,
  restartKernelEpic,
  watchExecutionStateEpic
} from "../src/kernel-lifecycle";

const buildScheduler = () =>
  new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

// Need to import this directly from the file to reassign it, because TS doesn't
// create a setter for re-exported names anymore.
import * as refs from "@nteract/types/lib/refs";
jest.spyOn(refs, "createKernelRef").mockReturnValue("newKernelRef");

describe("acquireKernelInfo", () => {
  test("sends a kernel_info_request and processes kernel_info_reply", async done => {
    const sent = new Subject();
    const received = new Subject();

    const mockSocket = Subject.create(sent, received);

    sent.subscribe((msg: JupyterMessage) => {
      expect(msg.header.msg_type).toEqual("kernel_info_request");

      const response = createMessage("kernel_info_reply" as MessageType);
      response.parent_header = msg.header;
      response.content = {
        status: "ok",
        protocol_version: "5.1",
        implementation: "ipython",
        implementation_version: "6.2.1",
        language_info: {
          name: "python",
          version: "3.6.5",
          mimetype: "text/x-python",
          codemirror_mode: { name: "ipython", version: 3 },
          pygments_lexer: "ipython3",
          nbconvert_exporter: "python",
          file_extension: ".py"
        },
        banner:
          "Python 3.6.5 (default, Mar 30 2018, 06:41:53) \nType 'copyright', 'credits' or 'license' for more information\nIPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.\n",
        help_links: [
          { text: "Python Reference", url: "https://docs.python.org/3.6" },
          {
            text: "IPython Reference",
            url: "https://ipython.org/documentation.html"
          },
          {
            text: "NumPy Reference",
            url: "https://docs.scipy.org/doc/numpy/reference/"
          },
          {
            text: "SciPy Reference",
            url: "https://docs.scipy.org/doc/scipy/reference/"
          },
          {
            text: "Matplotlib Reference",
            url: "https://matplotlib.org/contents.html"
          },
          {
            text: "SymPy Reference",
            url: "http://docs.sympy.org/latest/index.html"
          },
          {
            text: "pandas Reference",
            url: "https://pandas.pydata.org/pandas-docs/stable/"
          }
        ]
      };

      // TODO: Get the Rx handling proper here
      setTimeout(() => received.next(response), 100);
    });

    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "kernelRef",
        currentKernelspecsRef: "currentKernelspecsRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              kernelRef: stateModule.makeLocalKernelRecord({
                status: "not connected"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          }),
          kernelspecs: stateModule.makeKernelspecsRecord({
            byRef: Immutable.Map({
              currentKernelspecsRef: stateModule.makeKernelspecsByRefRecord({
                byName: Immutable.Map({ python: stateModule.makeKernelspec() })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({}),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    };

    const obs = acquireKernelInfo(
      mockSocket,
      "fakeKernelRef",
      "fakeContentRef",
      state,
      "python"
    );

    const actions = await obs.pipe(toArray()).toPromise();

    expect(actions).toEqual([
      {
        type: "CORE/SET_KERNEL_INFO",
        payload: {
          contentRef: "fakeContentRef",
          info: {
            protocolVersion: "5.1",
            implementation: "ipython",
            implementationVersion: "6.2.1",
            banner:
              "Python 3.6.5 (default, Mar 30 2018, 06:41:53) \nType 'copyright', 'credits' or 'license' for more information\nIPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.\n",
            helpLinks: [
              { text: "Python Reference", url: "https://docs.python.org/3.6" },
              {
                text: "IPython Reference",
                url: "https://ipython.org/documentation.html"
              },
              {
                text: "NumPy Reference",
                url: "https://docs.scipy.org/doc/numpy/reference/"
              },
              {
                text: "SciPy Reference",
                url: "https://docs.scipy.org/doc/scipy/reference/"
              },
              {
                text: "Matplotlib Reference",
                url: "https://matplotlib.org/contents.html"
              },
              {
                text: "SymPy Reference",
                url: "http://docs.sympy.org/latest/index.html"
              },
              {
                text: "pandas Reference",
                url: "https://pandas.pydata.org/pandas-docs/stable/"
              }
            ],
            languageName: "python",
            languageVersion: "3.6.5",
            mimetype: "text/x-python",
            fileExtension: ".py",
            pygmentsLexer: "ipython3",
            codemirrorMode: { name: "ipython", version: 3 },
            nbconvertExporter: "python"
          },
          kernelRef: "fakeKernelRef"
        }
      },
      {
        payload: {
          kernelRef: "fakeKernelRef",
          kernelStatus: "launched"
        },
        type: "SET_EXECUTION_STATE"
      },
      {
        payload: {
          contentRef: "fakeContentRef",
          kernelInfo: stateModule.makeKernelspec()
        },
        type: "SET_KERNEL_METADATA"
      }
    ]);

    done();
  });
  test("does not set kernel metadata if kernelspec name is not provided", async done => {
    const sent = new Subject();
    const received = new Subject();

    const mockSocket = Subject.create(sent, received);

    sent.subscribe((msg: JupyterMessage) => {
      expect(msg.header.msg_type).toEqual("kernel_info_request");

      const response = createMessage("kernel_info_reply" as MessageType);
      response.parent_header = msg.header;
      response.content = {
        status: "ok",
        protocol_version: "5.1",
        implementation: "ipython",
        implementation_version: "6.2.1",
        language_info: {
          name: "python",
          version: "3.6.5",
          mimetype: "text/x-python",
          codemirror_mode: { name: "ipython", version: 3 },
          pygments_lexer: "ipython3",
          nbconvert_exporter: "python",
          file_extension: ".py"
        },
        banner:
          "Python 3.6.5 (default, Mar 30 2018, 06:41:53) \nType 'copyright', 'credits' or 'license' for more information\nIPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.\n",
        help_links: [
          { text: "Python Reference", url: "https://docs.python.org/3.6" },
          {
            text: "IPython Reference",
            url: "https://ipython.org/documentation.html"
          },
          {
            text: "NumPy Reference",
            url: "https://docs.scipy.org/doc/numpy/reference/"
          },
          {
            text: "SciPy Reference",
            url: "https://docs.scipy.org/doc/scipy/reference/"
          },
          {
            text: "Matplotlib Reference",
            url: "https://matplotlib.org/contents.html"
          },
          {
            text: "SymPy Reference",
            url: "http://docs.sympy.org/latest/index.html"
          },
          {
            text: "pandas Reference",
            url: "https://pandas.pydata.org/pandas-docs/stable/"
          }
        ]
      };

      // TODO: Get the Rx handling proper here
      setTimeout(() => received.next(response), 100);
    });

    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "kernelRef",
        currentKernelspecsRef: "currentKernelspecsRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              kernelRef: stateModule.makeLocalKernelRecord({
                status: "not connected"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          }),
          kernelspecs: stateModule.makeKernelspecsRecord({
            byRef: Immutable.Map({
              currentKernelspecsRef: stateModule.makeKernelspecsByRefRecord({
                byName: Immutable.Map({ python: stateModule.makeKernelspec() })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({}),
      comms: stateModule.makeCommsRecord(),
      config: Immutable.Map({})
    };

    const obs = acquireKernelInfo(
      mockSocket,
      "fakeKernelRef",
      "fakeContentRef",
      state
    );

    const actions = await obs.pipe(toArray()).toPromise();

    expect(actions).toEqual([
      {
        type: "CORE/SET_KERNEL_INFO",
        payload: {
          contentRef: "fakeContentRef",
          info: {
            protocolVersion: "5.1",
            implementation: "ipython",
            implementationVersion: "6.2.1",
            banner:
              "Python 3.6.5 (default, Mar 30 2018, 06:41:53) \nType 'copyright', 'credits' or 'license' for more information\nIPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.\n",
            helpLinks: [
              { text: "Python Reference", url: "https://docs.python.org/3.6" },
              {
                text: "IPython Reference",
                url: "https://ipython.org/documentation.html"
              },
              {
                text: "NumPy Reference",
                url: "https://docs.scipy.org/doc/numpy/reference/"
              },
              {
                text: "SciPy Reference",
                url: "https://docs.scipy.org/doc/scipy/reference/"
              },
              {
                text: "Matplotlib Reference",
                url: "https://matplotlib.org/contents.html"
              },
              {
                text: "SymPy Reference",
                url: "http://docs.sympy.org/latest/index.html"
              },
              {
                text: "pandas Reference",
                url: "https://pandas.pydata.org/pandas-docs/stable/"
              }
            ],
            languageName: "python",
            languageVersion: "3.6.5",
            mimetype: "text/x-python",
            fileExtension: ".py",
            pygmentsLexer: "ipython3",
            codemirrorMode: { name: "ipython", version: 3 },
            nbconvertExporter: "python"
          },
          kernelRef: "fakeKernelRef"
        }
      },
      {
        payload: {
          kernelRef: "fakeKernelRef",
          kernelStatus: "launched"
        },
        type: "SET_EXECUTION_STATE"
      }
    ]);

    done();
  });
});

describe("watchExecutionStateEpic", () => {
  test("returns an Observable with an initial state of idle", done => {
    const action$ = of({
      type: actionsModule.LAUNCH_KERNEL_SUCCESSFUL,
      payload: {
        kernel: {
          channels: of({
            header: { msg_type: "status" },
            content: { execution_state: "idle" }
          }) as Subject<any>,
          cwd: "/home/tester",
          type: "websocket"
        },
        kernelRef: "fakeKernelRef",
        contentRef: "fakeContentRef",
        selectNextKernel: false
      }
    });
    const obs = watchExecutionStateEpic(action$);
    obs.pipe(toArray()).subscribe(
      // Every action that goes through should get stuck on an array
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionsModule.SET_EXECUTION_STATE]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });

  test("on kernel error returns executeFailed action", done => {
    const sent = new Subject();
    const received = new Subject();
    received.hasError = true;

    const mockSocket = Subject.create(sent, received);

    const action$ = of({
      type: actionsModule.LAUNCH_KERNEL_SUCCESSFUL,
      payload: {
        kernel: {
          channels: mockSocket,
          cwd: "/home/tester",
          type: "websocket"
        },
        kernelRef: "fakeKernelRef",
        contentRef: "fakeContentRef",
        selectNextKernel: false
      }
    });
    const obs = watchExecutionStateEpic(action$);
    obs.pipe(toArray()).subscribe(
      // Every action that goes through should get stuck on an array
      actions => {
        expect(actions).toEqual([
          {
            type: actionsModule.EXECUTE_FAILED,
            error: true,
            payload: {
              code: "EXEC_WEBSOCKET_ERROR",
              contentRef: "fakeContentRef",
              error: new Error(
                "The WebSocket connection has unexpectedly disconnected."
              )
            }
          }
        ]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});

describe("restartKernelEpic", () => {
  test("work for outputHandling None", () => {
    const contentRef = "contentRef";
    const newKernelRef = "newKernelRef";

    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "oldKernelRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              oldKernelRef: stateModule.makeLocalKernelRecord({
                status: "not connected"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({})
    };

    const testScheduler = buildScheduler();

    testScheduler.run(helpers => {
      const { hot, expectObservable } = helpers;
      const inputActions = {
        a: actionsModule.restartKernel({
          outputHandling: "None",
          kernelRef: "oldKernelRef",
          contentRef
        }),
        b: actionsModule.launchKernelSuccessful({
          kernel: undefined,
          kernelRef: newKernelRef,
          contentRef,
          selectNextKernel: true
        })
      };

      const outputActions = {
        c: actionsModule.killKernel({
          restarting: true,
          kernelRef: "oldKernelRef"
        }),
        d: actionsModule.launchKernelByName({
          kernelSpecName: undefined,
          cwd: ".",
          kernelRef: expect.any(String),
          selectNextKernel: true,
          contentRef
        }),
        e: actionsModule.restartKernelSuccessful({
          kernelRef: expect.any(String),
          contentRef
        }),
        n: sendNotification.create({
          title: "Kernel Restarting...",
          message: "Kernel unknown is restarting.",
          level: "success"
        })
      };

      const inputMarbles = "a----b|";
      const outputMarbles = "(cdn)e|";

      const inputAction$ = hot(inputMarbles, inputActions);
      const outputAction$ = restartKernelEpic(inputAction$, { value: state });

      expectObservable(outputAction$).toBe(outputMarbles, outputActions);
    });
  });
  test("work for outputHandling Restart and Run All", () => {
    const newKernelRef = "newKernelRef";

    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "oldKernelRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              oldKernelRef: stateModule.makeLocalKernelRecord({
                status: "not connected"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({})
    };

    const testScheduler = buildScheduler();

    testScheduler.run(helpers => {
      const { hot, expectObservable } = helpers;

      const inputActions = {
        a: actionsModule.restartKernel({
          outputHandling: "Run All",
          kernelRef: "oldKernelRef",
          contentRef: "contentRef"
        }),
        b: actionsModule.launchKernelSuccessful({
          kernel: undefined,
          kernelRef: newKernelRef,
          contentRef: "contentRef",
          selectNextKernel: true
        })
      };

      const outputActions = {
        c: actionsModule.killKernel({
          restarting: true,
          kernelRef: "oldKernelRef"
        }),
        d: actionsModule.launchKernelByName({
          kernelSpecName: undefined,
          cwd: ".",
          kernelRef: expect.any(String),
          selectNextKernel: true,
          contentRef: "contentRef"
        }),
        e: actionsModule.restartKernelSuccessful({
          kernelRef: expect.any(String),
          contentRef: "contentRef"
        }),
        f: actionsModule.executeAllCells({ contentRef: "contentRef" }),
        n: sendNotification.create({
          title: "Kernel Restarting...",
          message: "Kernel unknown is restarting.",
          level: "success"
        })
      };

      const inputMarbles = "a----b---|";
      const outputMarbles = "(cdn)(ef)|";

      const inputAction$ = hot(inputMarbles, inputActions);
      const outputAction$ = restartKernelEpic(inputAction$, { value: state });

      expectObservable(outputAction$).toBe(outputMarbles, outputActions);
    });
  });
  test("emits no action for remote kernel", async () => {
    const state = {
      core: stateModule.makeStateRecord({
        kernelRef: "oldKernelRef",
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({
              oldKernelRef: stateModule.makeRemoteKernelRecord({
                status: "idle",
                type: "websocket"
              })
            })
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "oldKernelRef"
                })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({})
    };

    const responses = await restartKernelEpic(
      of(
        actionsModule.restartKernel({
          outputHandling: "Run All",
          kernelRef: "oldKernelRef",
          contentRef: "contentRef"
        })
      ),
      new StateObservable(new Subject(), state)
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([]);
  });
  test("returns an error for no valid kernel ref", async () => {
    const state = {
      core: stateModule.makeStateRecord({
        entities: stateModule.makeEntitiesRecord({
          kernels: stateModule.makeKernelsRecord({
            byRef: Immutable.Map({})
          }),
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              contentRef: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: "notReal"
                })
              })
            })
          })
        })
      }),
      app: stateModule.makeAppRecord({})
    };

    const responses = await restartKernelEpic(
      of(
        actionsModule.restartKernel({
          outputHandling: "Run All",
          kernelRef: "oldKernelRef",
          contentRef: "contentRef"
        })
      ),
      new StateObservable(new Subject(), state)
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      sendNotification.create({
        title: "Failure to Restart",
        message: "Unable to restart kernel, please select a new kernel.",
        level: "error"
      })
    ]);
  });
});

describe("launchKernelWhenNotebookSet", () => {
  it("does nothing if content is not a notebook", done => {
    const contentRef = stateModule.createContentRef();
    const kernelRef = stateModule.createKernelRef();
    const action$ = of(
      actionsModule.fetchContentFulfilled({
        contentRef,
        filepath: "my-file.txt",
        model: {},
        kernelRef
      })
    );
    const state$ = new StateObservable(new Subject(), mockAppState({}));
    const obs = launchKernelWhenNotebookSetEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      actions => {
        expect(actions).toEqual([]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
  it("does nothing if content already has a kernel", done => {
    const state = mockAppState({});
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const kernelRef = stateModule.createKernelRef();
    const action$ = of(
      actionsModule.fetchContentFulfilled({
        contentRef,
        filepath: "my-notebook",
        model: {},
        kernelRef
      })
    );
    const state$ = new StateObservable(new Subject(), state);
    const obs = launchKernelWhenNotebookSetEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
  it("emits a LAUNCH_KERNEL_BY_NAME action for valid notebook and unlaunched kernel", done => {
    const contentRef = stateModule.createContentRef();
    const state = {
      core: {
        entities: stateModule.makeEntitiesRecord({
          contents: stateModule.makeContentsRecord({
            byRef: Immutable.Map({
              [contentRef]: stateModule.makeNotebookContentRecord({
                model: stateModule.makeDocumentRecord({
                  kernelRef: null
                })
              })
            })
          })
        })
      }
    };
    const action$ = of(
      actionsModule.fetchContentFulfilled({
        contentRef,
        filepath: "my-file.txt",
        model: {}
      })
    );
    const state$ = new StateObservable(new Subject(), state);
    const obs = launchKernelWhenNotebookSetEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionsModule.LAUNCH_KERNEL_BY_NAME]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});
