import { stringifyNotebook } from "@nteract/commutable";
import { actions, AppState, ContentRecord, createContentRef, createKernelspecsRef, makeAppRecord, makeCommsRecord, makeContentsRecord, makeDummyContentRecord, makeEntitiesRecord, makeHostsRecord, makeJupyterHostRecord, makeNotebookContentRecord, makeStateRecord, makeTransformsRecord } from "@nteract/core";
import { fixtureJSON, mockAppState } from "@nteract/fixtures";
import * as FileSaver from "file-saver";
import * as Immutable from "immutable";
import { StateObservable } from "redux-observable";
import { of, Subject } from "rxjs";
import { map, toArray } from "rxjs/operators";
import { closeNotebookEpic, downloadString, fetchContentEpic, saveAsContentEpic, saveContentEpic, updateContentEpic } from "../src/contents";

jest.doMock("rx-jupyter", () => ({
  contents: {
    JupyterContentProvider: {
      save: (severConfig, filepath, model) => {
        return of({ response: {} });
      },
      update: (serverConfig, prevFilePath, object) => {
        return of({ status: 200, response: {} });
      },
      get: jest.fn()
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
          }
        ))
        .mockReturnValueOnce(
          of({
            status: 200,
            response: { last_modified: "one_value" }
          }
        )),
    }
  }
}));

import { contents } from "rx-jupyter";

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
      of(
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
      of(
        actions.saveAs({ filepath: "test.ipynb", contentRef })
      ),
      new StateObservable(new Subject(), state),
      { contentProvider: contents.JupyterContentProvider }
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
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
  it("updates last_modified date from server-side model on save", async () => {
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
      of(
        actions.save({ filepath: "test.ipynb", contentRef })
      ),
      new StateObservable(new Subject(), state),
      { contentProvider: contents.JupyterContentProvider }
    )
      .pipe(toArray())
      .toPromise();

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
      of(actions.downloadContent({ contentRef })),
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
      of(actions.downloadContent({ contentRef })),
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
    const action$ = of(
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
    const action$ = of(
      actions.fetchContent({
        contentRef,
        filepath: "my-file.ipynb"
      })
    );
    const state$ = new StateObservable<AppState>(new Subject(), state);
    const obs = fetchContentEpic(action$, state$, { contentProvider: contents.JupyterContentProvider });
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.FETCH_CONTENT_FULFILLED]);
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
    const action$ = of(
      actions.changeContentName({
        contentRef,
        filepath: "test.ipynb"
      })
    );
    const state$ = new StateObservable<AppState>(new Subject(), state);
    const obs = updateContentEpic(action$, state$, { contentProvider: contents.JupyterContentProvider });
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
});
