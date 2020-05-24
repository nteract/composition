import { monocellNotebook, toJS } from "@nteract/commutable";
import { actions } from "@nteract/core";
import { fixtureCommutable, mockAppState } from "@nteract/fixtures";
import { StateObservable } from "redux-observable";
import { of, Subject } from "rxjs";
import { toArray } from "rxjs/operators";

import {
  extractNewKernel,
  launchKernelWhenNotebookSetEpic,
  newNotebookEpic
} from "../../../src/notebook/epics/loading";

const path = require("path");

describe("extractNewKernel", () => {
  test("extracts and launches the kernel from a notebook", () => {
    expect(extractNewKernel("/tmp/test.ipynb", fixtureCommutable)).toEqual({
      kernelSpecName: "python3",
      cwd: path.resolve("/tmp")
    });
  });
});

describe("newNotebookEpic", () => {
  test("calls new Kernel after creating a new notebook", async () => {
    const action$ = of({
      type: actions.NEW_NOTEBOOK,
      payload: {
        filepath: null,
        cwd: "/home/whatever",
        kernelSpec: {
          name: "hylang"
        },
        kernelRef: "kRef",
        contentRef: "cRef"
      }
    });
    const responseActions = await newNotebookEpic(action$)
      .pipe(toArray())
      .toPromise();
    const filepath =
      process.platform === "win32"
        ? "\\home\\whatever\\Untitled.ipynb"
        : "/home/whatever/Untitled.ipynb";

    expect(responseActions).toEqual([
      {
        type: actions.FETCH_CONTENT_FULFILLED,
        payload: {
          contentRef: "cRef",
          kernelRef: "kRef",
          filepath,
          model: {
            type: "notebook",
            mimetype: "application/x-ipynb+json",
            format: "json",
            content: toJS(
              monocellNotebook
                .setIn(["metadata", "kernel_info", "name"], "hylang")
                .setIn(["metadata", "language_info", "name"], "hylang")
            ),
            writable: true,
            name: "Untitled.ipynb",
            path: filepath,
            created: expect.any(String),
            last_modified: expect.any(String)
          }
        }
      }
    ]);
  });
});

describe("newNotebookEpicNamed", () => {
  test("calls new Kernel after creating a new notebook with given name", async () => {
    const action$ = of({
      type: actions.NEW_NOTEBOOK,
      payload: {
        filepath: "/home/whatever2/some.ipynb",
        cwd: "/home/whatever",
        kernelSpec: {
          name: "hylang"
        },
        kernelRef: "kRef",
        contentRef: "cRef"
      }
    });
    const responseActions = await newNotebookEpic(action$)
      .pipe(toArray())
      .toPromise();
    const filepath =
      process.platform === "win32"
        ? "\\home\\whatever2\\some.ipynb"
        : "/home/whatever2/some.ipynb";

    expect(responseActions).toEqual([
      {
        type: actions.FETCH_CONTENT_FULFILLED,
        payload: {
          contentRef: "cRef",
          kernelRef: "kRef",
          filepath,
          model: {
            type: "notebook",
            mimetype: "application/x-ipynb+json",
            format: "json",
            content: toJS(
              monocellNotebook
                .setIn(["metadata", "kernel_info", "name"], "hylang")
                .setIn(["metadata", "language_info", "name"], "hylang")
            ),
            writable: true,
            name: "some.ipynb",
            path: filepath,
            created: expect.any(String),
            last_modified: expect.any(String)
          }
        }
      }
    ]);
  });
});

describe("launchKernelWhenNotebookSetEpic", () => {
  it("does nothing for non-notebook files", done => {
    const state = mockAppState({});
    const action$ = of(
      actions.fetchContentFulfilled({ contentRef: "test" })
    );
    const state$ = new StateObservable(new Subject(), state);
    const obs = launchKernelWhenNotebookSetEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([]);
      },
      err => done.fail(err),
      () => done()
    );
  });
  it("launches a kernel for a given content", done => {
    const state = mockAppState({});
    const contentRef = state.core.entities.contents.byRef.keySeq().first();
    const action$ = of(
      actions.fetchContentFulfilled({ contentRef })
    );
    const state$ = new StateObservable(new Subject(), state);
    const obs = launchKernelWhenNotebookSetEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([actions.LAUNCH_KERNEL_BY_NAME]);
      },
      err => done.fail(err),
      () => done()
    );
  });
});
