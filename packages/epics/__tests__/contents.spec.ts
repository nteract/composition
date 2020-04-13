import { stringifyNotebook } from "@nteract/commutable";
import {
  actions,
  AppState,
  ContentRecord,
  createContentRef,
  createKernelspecsRef,
  makeAppRecord,
  makeCommsRecord,
  makeContentsRecord,
  makeDocumentRecord,
  makeDummyContentRecord,
  makeEntitiesRecord,
  makeHostsRecord,
  makeJupyterHostRecord,
  makeNotebookContentRecord,
  makeStateRecord,
  makeTransformsRecord
} from "@nteract/core";
import { fixtureJSON, mockAppState } from "@nteract/fixtures";
import FileSaver from "file-saver";
import * as Immutable from "immutable";
import { ActionsObservable, StateObservable } from "redux-observable";
import { contents } from "rx-jupyter";
import { of, Subject } from "rxjs";
import { map, take, toArray } from "rxjs/operators";
import {
  autoSaveCurrentContentEpic,
  closeNotebookEpic,
  downloadString,
  fetchContentEpic,
  saveAsContentEpic,
  saveContentEpic,
  updateContentEpic
} from "../src/contents";

/**
 * Fake timers enables us to simulate the passing of time for
 * epics that use Observable.interval or retry. Specifically,
 * the saveContent and autoSaveContent epics.
 */
jest.useFakeTimers();

jest.mock("rx-jupyter", () => {
  const { of } = require("rxjs");

  return {
    contents: {
      JupyterContentProvider: {
        save: (severConfig, filepath, model) => {
          return of({ response: {} });
        },
        update: (serverConfig, prevFilePath, object) => {
          return of({ status: 200, response: {} });
        },
        get: jest
          .fn()
          .mockReturnValue(
            of({
              status: 200,
              response: { last_modified: "some_stable_value" }
            })
          )
          .mockReturnValueOnce(
            of({
              status: 200,
              response: { last_modified: "one_value" }
            })
          )
          .mockReturnValueOnce(
            of({
              status: 200,
              response: { last_modified: "one_value" }
            })
          )
      }
    }
  };
});

describe("downloadString", () => {
  it("calls FileSaver.saveAs with notebook and filename", () => {
    const filename = "/here/there/awesome.ipynb";
    const expectedData = fixtureJSON;
    expect(FileSaver.saveAs).not.toHaveBeenCalled();
    downloadString(
      stringifyNotebook(fixtureJSON),
      filename,
      "application/json"
    );
    expect(FileSaver.saveAs).toHaveBeenCalledTimes(1);
    const actualMockBlobResponse = (FileSaver.saveAs as any).mock.calls[0][0];
    const actualFilename = (FileSaver.saveAs as any).mock.calls[0][1];

    expect(actualMockBlobResponse).toEqual({
      content: [stringifyNotebook(expectedData)],
      options: { type: "application/json" }
    });

    expect(actualFilename).toBe("awesome.ipynb");
  });
});

describe("saveAs", () => {
  const contentRef = createContentRef();
  const kernelspecsRef = createKernelspecsRef();
  it("does not save if there is no content", async () => {
    const state = {
      app: makeAppRecord({
        version: "test",
        host: makeJupyterHostRecord({})
      }),
      comms: makeCommsRecord(),
      config: Immutable.Map({
        theme: "light"
      }),
      core: makeStateRecord({
        currentKernelspecsRef: kernelspecsRef,
        entities: makeEntitiesRecord({
          hosts: makeHostsRecord({}),
          contents: makeContentsRecord({}),
          transforms: makeTransformsRecord({
            displayOrder: Immutable.List([]),
            byId: Immutable.Map({})
          })
        })
      })
    };

    const responses = await saveAsContentEpic(
      ActionsObservable.of(
        actions.saveAs({ filepath: "test.ipynb", contentRef })
      ),
      new StateObservable(new Subject(), state),
      { contentProvider: contents.JupyterContentProvider }
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      actions.saveAsFailed({
        contentRef,
        error: new Error("Content was not set.")
      })
    ]);
  });
  it("saves notebook files", async () => {
    const state = {
      app: makeAppRecord({
        version: "test",
        host: makeJupyterHostRecord({})
      }),
      comms: makeCommsRecord(),
      config: Immutable.Map({
        theme: "light"
      }),
      core: makeStateRecord({
        currentKernelspecsRef: kernelspecsRef,
        entities: makeEntitiesRecord({
          hosts: makeHostsRecord({}),
          contents: makeContentsRecord({
            byRef: Immutable.Map<string, ContentRecord>().set(
              contentRef,
              makeNotebookContentRecord({
                filepath: "a-different-filename.ipynb"
              })
            )
          }),
          transforms: makeTransformsRecord({
            displayOrder: Immutable.List([]),
            byId: Immutable.Map({})
          })
        })
      })
    };

    const responses = await saveAsContentEpic(
      ActionsObservable.of(
        actions.saveAs({ filepath: "test.ipynb", contentRef })
      ),
      new StateObservable(new Subject(), state),
      { contentProvider: contents.JupyterContentProvider }
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      actions.changeFilename({
        contentRef,
        filepath: "test.ipynb"
      }),
      actions.saveAsFulfilled({
        contentRef,
        model: {}
      })
    ]);
  });
});

describe("save", () => {
  const contentRef = createContentRef();
  const kernelspecsRef = createKernelspecsRef();
  it("updates last_modified date from server-side model on save", async done => {
    const state = {
      app: makeAppRecord({
        version: "test",
        host: makeJupyterHostRecord({})
      }),
      comms: makeCommsRecord(),
      config: Immutable.Map({
        theme: "light"
      }),
      core: makeStateRecord({
        currentKernelspecsRef: kernelspecsRef,
        entities: makeEntitiesRecord({
          hosts: makeHostsRecord({}),
          contents: makeContentsRecord({
            byRef: Immutable.Map<string, ContentRecord>().set(
              contentRef,
              makeNotebookContentRecord({
                filepath: "a-different-filename.ipynb"
              })
            )
          }),
          transforms: makeTransformsRecord({
            displayOrder: Immutable.List([]),
            byId: Immutable.Map({})
          })
        })
      })
    };

    const responses = [];
    saveContentEpic(
      ActionsObservable.of(
        actions.save({ filepath: "test.ipynb", contentRef })
      ),
      new StateObservable(new Subject(), state),
      { contentProvider: contents.JupyterContentProvider }
    ).subscribe({
      next: value => responses.push(value),
      complete: done()
    });

    jest.runAllTimers();

    expect(responses).toEqual([
      actions.saveFulfilled({
        contentRef,
        model: { last_modified: "one_value" }
      }),
      actions.saveFulfilled({
        contentRef,
        model: { last_modified: "some_stable_value" }
      })
    ]);
  });
  it("supports downloading contents of notebook to disk", async () => {
    const state = {
      app: makeAppRecord({
        version: "test",
        host: makeJupyterHostRecord({})
      }),
      comms: makeCommsRecord(),
      config: Immutable.Map({
        theme: "light"
      }),
      core: makeStateRecord({
        currentKernelspecsRef: kernelspecsRef,
        entities: makeEntitiesRecord({
          hosts: makeHostsRecord({}),
          contents: makeContentsRecord({
            byRef: Immutable.Map<string, ContentRecord>().set(
              contentRef,
              makeNotebookContentRecord({
                filepath: "a-different-filename.ipynb"
              })
            )
          }),
          transforms: makeTransformsRecord({
            displayOrder: Immutable.List([]),
            byId: Immutable.Map({})
          })
        })
      })
    };

    const responses = await saveContentEpic(
      ActionsObservable.of(actions.downloadContent({ contentRef })),
      new StateObservable(new Subject(), state),
      { contentProvider: contents.JupyterContentProvider }
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      actions.downloadContentFulfilled({
        contentRef
      })
    ]);
  });
  it("does nothing if requested download is not notebook or file", async () => {
    const state = {
      app: makeAppRecord({
        version: "test",
        host: makeJupyterHostRecord({})
      }),
      comms: makeCommsRecord(),
      config: Immutable.Map({
        theme: "light"
      }),
      core: makeStateRecord({
        currentKernelspecsRef: kernelspecsRef,
        entities: makeEntitiesRecord({
          hosts: makeHostsRecord({}),
          contents: makeContentsRecord({
            byRef: Immutable.Map<string, ContentRecord>().set(
              contentRef,
              makeDummyContentRecord({
                filepath: "a-different-filename.ipynb"
              })
            )
          }),
          transforms: makeTransformsRecord({
            displayOrder: Immutable.List([]),
            byId: Immutable.Map({})
          })
        })
      })
    };

    const responses = await saveContentEpic(
      ActionsObservable.of(actions.downloadContent({ contentRef })),
      new StateObservable(new Subject(), state),
      { contentProvider: contents.JupyterContentProvider }
    )
      .pipe(
        map(action => action.type),
        toArray()
      )
      .toPromise();

    expect(responses).toEqual([actions.SAVE_FAILED]);
  });
});

describe("closeNotebookEpic", () => {
  it("can dispatch correct closing actions", done => {
    const state = mockAppState({});
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = ActionsObservable.of(
      actions.closeNotebook({
        contentRef
      })
    );
    const state$ = new StateObservable<AppState>(new Subject(), state);
    const obs = closeNotebookEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.DISPOSE_CONTENT, actions.KILL_KERNEL]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});

describe("fetchContentEpic", () => {
  it("emits FETCH_CONTENT_FULFILLED action on successful completion", done => {
    const state = {
      ...mockAppState({}),
      app: makeAppRecord({
        host: makeJupyterHostRecord({})
      })
    };
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = ActionsObservable.of(
      actions.fetchContent({
        contentRef,
        filepath: "my-file.ipynb"
      })
    );
    const state$ = new StateObservable<AppState>(new Subject(), state);
    const obs = fetchContentEpic(action$, state$, {
      contentProvider: contents.JupyterContentProvider
    });
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.FETCH_CONTENT_FULFILLED]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
  it("emits FETCH_CONTENT_FAILED action on failed completion", done => {
    const state = {
      ...mockAppState({}),
      app: makeAppRecord({
        host: makeJupyterHostRecord({})
      })
    };
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = ActionsObservable.of(
      actions.fetchContent({
        contentRef,
        filepath: "my-file.ipynb"
      })
    );
    const state$ = new StateObservable<AppState>(new Subject(), state);
    const obs = fetchContentEpic(action$, state$, {
      contentProvider: {
        ...contents.JupyterContentProvider,
        get: (serverConfig, prevFilePath, object) => {
          return of({ status: 500, response: {} });
        }
      }
    });
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.FETCH_CONTENT_FAILED]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});

describe("updateContentEpic", () => {
  it("changes the content name on valid details", done => {
    const state = {
      ...mockAppState({}),
      app: makeAppRecord({
        host: makeJupyterHostRecord()
      })
    };
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = ActionsObservable.of(
      actions.changeContentName({
        contentRef,
        filepath: "test.ipynb"
      })
    );
    const state$ = new StateObservable<AppState>(new Subject(), state);
    const obs = updateContentEpic(action$, state$, {
      contentProvider: contents.JupyterContentProvider
    });
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.CHANGE_CONTENT_NAME_FULFILLED]);
      },
      err => {
        console.log(err);
        done.fail(err);
      }, // It should not error in the stream
      () => done()
    );
  });
  it("throws an error action on invalid response from server", done => {
    const state = {
      ...mockAppState({}),
      app: makeAppRecord({
        host: makeJupyterHostRecord()
      })
    };
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = ActionsObservable.of(
      actions.changeContentName({
        contentRef,
        filepath: "test.ipynb"
      })
    );
    const state$ = new StateObservable<AppState>(new Subject(), state);
    const obs = updateContentEpic(action$, state$, {
      contentProvider: {
        ...contents.JupyterContentProvider,
        update: (serverConfig, prevFilePath, object) => {
          return of({ status: 500, response: {} });
        }
      }
    });
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.CHANGE_CONTENT_NAME_FAILED]);
      },
      err => {
        console.log(err);
        done.fail(err);
      }, // It should not error in the stream
      () => done()
    );
  });
});

describe("autoSaveContentEpic", () => {
  it("returns a valid Observable", () => {
    const action$ = ActionsObservable.from([]);
    const state$ = new StateObservable(new Subject(), mockAppState({}));
    expect(autoSaveCurrentContentEpic(action$, state$)).not.toBeNull();
  });
  it("dispatches a save action on content change", async done => {
    const action$ = ActionsObservable.from([]);
    const stateSubject$ = new Subject();
    const state = {
      app: {},
      config: Immutable.Map({
        autoSaveInterval: 100
      }),
      core: {
        entities: {
          kernels: {},
          contents: {
            byRef: Immutable.Map({
              aContentRef: {
                filepath: "test.ipynb",
                type: "notebook",
                model: makeDocumentRecord({
                  type: "notebook",
                  notebook: Immutable.Map({ key: "to be cleared" }),
                  savedNotebook: Immutable.Map({ key: "to be cleared" })
                })
              }
            })
          }
        }
      }
    };
    const state$ = new StateObservable(stateSubject$, state);
    const newState = {
      app: {},
      config: Immutable.Map({
        autoSaveInterval: 100
      }),
      core: {
        entities: {
          kernels: {},
          contents: {
            byRef: Immutable.Map({
              aContentRef: {
                filepath: "test.ipynb",
                type: "notebook",
                model: makeDocumentRecord({
                  type: "notebook",
                  notebook: Immutable.Map({ key: "to be cleared" }),
                  savedNotebook: Immutable.Map({
                    key: Math.random().toString()
                  })
                })
              }
            })
          }
        }
      }
    };

    const results = [];
    autoSaveCurrentContentEpic(action$, state$).subscribe({
      next: value => {
        results.push(value);
      },
      complete: () => done()
    });
    stateSubject$.next(newState);
    jest.runTimersToTime(200);
    expect(results.map(a => a.type)).toEqual([actions.SAVE, actions.SAVE]);
    done();
  });
  it("dispatches nothing on no content change", async done => {
    const action$ = ActionsObservable.from([]);
    const stateSubject$ = new Subject();
    const state = {
      app: {},
      config: Immutable.Map({
        autoSaveInterval: 100
      }),
      core: {
        entities: {
          contents: makeContentsRecord({
            byRef: Immutable.Map({
              aContentRef: {
                type: "notebook",
                filepath: "test.ipynb",
                model: makeDocumentRecord({
                  type: "notebook",
                  notebook: Immutable.Map({ key: "to be cleared" }),
                  savedNotebook: Immutable.Map({ key: "to be cleared" })
                })
              }
            })
          }),
          kernels: {}
        }
      }
    };
    const state$ = new StateObservable(stateSubject$, state);

    const results = [];
    autoSaveCurrentContentEpic(action$, state$).subscribe({
      next: value => {
        results.push(value);
      },
      complete: () => done()
    });
    stateSubject$.next(state);
    jest.runTimersToTime(200);
    expect(results.map(a => a.type)).toEqual([]);
    done();
  });
});
