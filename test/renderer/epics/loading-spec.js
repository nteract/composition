import { ActionsObservable } from "redux-observable";

import { expect } from "chai";

import { dummyCommutable, dummy } from "../dummy-nb";

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

import "rxjs/add/operator/toArray";

const path = require("path");

describe("load", () => {
  it("loads a notebook", () => {
    expect(load("mytest.ipynb")).to.deep.equal({
      type: LOAD,
      filename: "mytest.ipynb"
    });
  });
});

describe("newNotebook", () => {
  it("creates a new notebook", () => {
    expect(newNotebook({ spec: "hokey" }, "/tmp")).to.deep.equal({
      type: NEW_NOTEBOOK,
      kernelSpec: { spec: "hokey" },
      cwd: "/tmp"
    });
  });
});

describe("notebookLoaded", () => {
  it("sets a notebook", () => {
    expect(notebookLoaded("test", dummyCommutable)).to.deep.equal({
      type: SET_NOTEBOOK,
      filename: "test",
      notebook: dummyCommutable
    });
  });
});

describe("extractNewKernel", () => {
  it("extracts and launches the kernel from a notebook", () => {
    expect(extractNewKernel("/tmp/test.ipynb", dummyCommutable)).to.deep.equal({
      kernelSpecName: "python3",
      cwd: path.resolve("/tmp")
    });
  });
});

describe("convertRawNotebook", () => {
  it("converts a raw notebook", () => {
    const converted = convertRawNotebook("/tmp/test.ipynb", dummy);
    expect(converted.filename).to.equal("/tmp/test.ipynb");

    const notebook = converted.notebook;
    expect(dummyCommutable.get("metadata").equals(notebook.get("metadata"))).to
      .be.true;
  });
});

describe("loadingEpic", () => {
  it("errors without a filename", done => {
    const action$ = ActionsObservable.of({ type: LOAD });
    const responseActions = loadEpic(action$);
    responseActions.subscribe(
      _ => _,
      err => {
        expect(err.message).to.equal("load needs a filename");
        done();
      },
      () => {
        expect.fail();
      }
    );
  });
  it("errors when file cant be read", done => {
    const action$ = ActionsObservable.of({ type: LOAD, filename: "file" });
    const responseActions = loadEpic(action$);
    responseActions.toArray().subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).to.deep.equal(["ERROR"]);
      },
      () => expect.fail(),
      () => done()
    );
  });
});

describe("newNotebookEpic", () => {
  it("calls new Kernel after creating a new notebook", done => {
    const action$ = ActionsObservable.of({ type: NEW_NOTEBOOK });
    const responseActions = newNotebookEpic(action$);
    responseActions.toArray().subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).to.deep.equal([SET_NOTEBOOK, "LAUNCH_KERNEL"]);
      },
      () => expect.fail(),
      () => done()
    );
  });
});
