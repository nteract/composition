import { ActionsObservable } from "redux-observable";

import { monocellNotebook, toJS } from "@nteract/commutable";

import { dummyCommutable } from "@nteract/core/dummy";

import {
  extractNewKernel,
  fetchContentEpic,
  newNotebookEpic
} from "../../../src/notebook/epics/loading";

import { actionTypes } from "@nteract/core";

import { toArray } from "rxjs/operators";

const path = require("path");

describe("extractNewKernel", () => {
  test("extracts and launches the kernel from a notebook", () => {
    expect(extractNewKernel("/tmp/test.ipynb", dummyCommutable)).toEqual({
      kernelSpecName: "python3",
      cwd: path.resolve("/tmp")
    });
  });
});

describe("loadingEpic", () => {
  test("errors without a filename", done => {
    const action$ = ActionsObservable.of({
      type: "CORE/FETCH_CONTENT",
      payload: {}
    });
    const responseActions = fetchContentEpic(action$);
    responseActions.subscribe(
      _ => _,
      err => {
        expect(err.message).toBe("fetch content needs a path");
        done();
      },
      () => {
        done.fail();
      }
    );
  });
  test("errors when file cant be read", async function() {
    const action$ = ActionsObservable.of({
      type: "CORE/FETCH_CONTENT",
      payload: { filepath: "file" }
    });

    const responseActions = await fetchContentEpic(action$)
      .pipe(toArray())
      .toPromise();

    expect(responseActions).toEqual([
      {
        payload: {
          error: expect.anything(),
          filepath: "file"
        },
        error: true,
        type: "CORE/FETCH_CONTENT_FAILED"
      }
    ]);
  });
});

describe("newNotebookEpic", () => {
  test("calls new Kernel after creating a new notebook", async function() {
    const action$ = ActionsObservable.of({
      type: actionTypes.NEW_NOTEBOOK,
      payload: {
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

    expect(responseActions).toEqual([
      {
        type: actionTypes.FETCH_CONTENT_FULFILLED,
        payload: {
          contentRef: "cRef",
          kernelRef: "kRef",
          filepath: "",
          model: {
            type: "notebook",
            mimetype: null,
            format: "json",
            content: toJS(
              monocellNotebook
                .setIn(["metadata", "kernel_info", "name"], "hylang")
                .setIn(["metadata", "language_info", "name"], "hylang")
            ),
            writable: true,
            name: null,
            path: null,
            created: expect.any(Date),
            last_modified: expect.any(Date)
          }
        }
      }
    ]);
  });
});
