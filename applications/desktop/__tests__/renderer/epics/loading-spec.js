import { ActionsObservable } from "redux-observable";

import { dummyCommutable, dummy } from "@nteract/core/lib/dummy";

import {
  load,
  newNotebook,
  notebookLoaded,
  extractNewKernel,
  convertRawNotebook,
  LOAD,
  loadEpic,
  NEW_NOTEBOOK,
  SET_NOTEBOOK,
  newNotebookEpic
} from "../../../src/notebook/epics/loading";

import { toArray } from "rxjs/operators";

const path = require("path");

describe("load", () => {
  test("loads a notebook", () => {
    expect(load("mytest.ipynb")).toEqual({
      type: LOAD,
      filename: "mytest.ipynb"
    });
  });
});

describe("newNotebook", () => {
  test("creates a new notebook", () => {
    expect(newNotebook({ spec: "hokey" }, "/tmp")).toEqual({
      type: NEW_NOTEBOOK,
      kernelSpec: { spec: "hokey" },
      cwd: "/tmp"
    });
  });
});

describe("notebookLoaded", () => {
  test("sets a notebook", () => {
    expect(notebookLoaded("test", dummyCommutable)).toEqual({
      type: SET_NOTEBOOK,
      filename: "test",
      notebook: dummyCommutable
    });
  });
});

describe("extractNewKernel", () => {
  test("extracts and launches the kernel from a notebook", () => {
    expect(extractNewKernel("/tmp/test.ipynb", dummyCommutable)).toEqual({
      kernelSpecName: "python3",
      cwd: path.resolve("/tmp")
    });
  });
});

describe("convertRawNotebook", () => {
  test("converts a raw notebook", () => {
    const converted = convertRawNotebook("/tmp/test.ipynb", dummy);
    expect(converted.filename).toBe("/tmp/test.ipynb");

    const notebook = converted.notebook;
    expect(
      dummyCommutable.get("metadata").equals(notebook.get("metadata"))
    ).toBe(true);
  });
});

describe("loadingEpic", () => {
  test("errors without a filename", done => {
    const action$ = ActionsObservable.of({ type: LOAD });
    const responseActions = loadEpic(action$);
    responseActions.subscribe(
      _ => _,
      err => {
        expect(err.message).toBe("load needs a filename");
        done();
      },
      () => {
        expect.fail();
      }
    );
  });
  test("errors when file cant be read", done => {
    const action$ = ActionsObservable.of({ type: LOAD, filename: "file" });
    const responseActions = loadEpic(action$);
    responseActions.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual(["ERROR"]);
      },
      () => expect.fail(),
      () => done()
    );
  });
});

describe("newNotebookEpic", () => {
  test("calls new Kernel after creating a new notebook", done => {
    const action$ = ActionsObservable.of({ type: NEW_NOTEBOOK });
    const responseActions = newNotebookEpic(action$);
    responseActions.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([SET_NOTEBOOK, "LAUNCH_KERNEL"]);
      },
      () => expect.fail(),
      () => done()
    );
  });
});
