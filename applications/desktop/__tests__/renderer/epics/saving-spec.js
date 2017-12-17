jest.mock("fs");
import { ActionsObservable } from "redux-observable";
import { dummyStore, dummyCommutable } from "@nteract/core/lib/dummy";

import { save, saveAs } from "@nteract/core/actions";

import {
  SAVE,
  SAVE_AS,
  DONE_SAVING,
  CHANGE_FILENAME
} from "@nteract/core/constants";

import { saveEpic, saveAsEpic } from "../../../src/notebook/epics/saving";

import { of } from "rxjs/observable/of";
import { catchError } from "rxjs/operators";

describe("save", () => {
  test("creates a SAVE action", () => {
    expect(save("test/test-save.ipynb", dummyCommutable)).toEqual({
      type: SAVE,
      filename: "test/test-save.ipynb",
      notebook: dummyCommutable
    });
  });
});

describe("saveAs", () => {
  test("creates a SAVE_AS action", () => {
    expect(saveAs("test/test-saveas.ipynb", dummyCommutable)).toEqual({
      type: SAVE_AS,
      filename: "test/test-saveas.ipynb",
      notebook: dummyCommutable
    });
  });
});

describe("saveEpic", () => {
  test("throws an error when no filename provided", done => {
    const input$ = of({ type: SAVE });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const store = dummyStore();
    const responseActions = saveEpic(action$, store).pipe(
      catchError(error => {
        expect(error.message).toBe("save needs a filename");
        return of({ type: SAVE });
      })
    );
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => actionBuffer.push(x.type),
      err => done.fail(err),
      () => {
        // It should not error in the stream
        expect(actionBuffer).toEqual([SAVE]);
        done();
      }
    );
  });
  test("works when passed filename and notebook", done => {
    const input$ = of(save("filename", dummyCommutable));
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const store = dummyStore();
    const responseActions = saveEpic(action$, store);
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => actionBuffer.push(x.type),
      err => done.fail(err),
      () => {
        // It should not error in the stream
        expect(actionBuffer).toEqual([DONE_SAVING]);
        done();
      }
    );
  });
});

describe("saveAsEpic", () => {
  test("works when passed actions of type SAVE_AS", done => {
    const input$ = of(saveAs("filename", dummyCommutable));
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = saveAsEpic(action$);
    responseActions.subscribe(
      // Every action that goes through should get stuck on an array
      x => actionBuffer.push(x.type),
      () => done.fail(err),
      () => {
        // It should not error in the stream
        expect(actionBuffer).toEqual([CHANGE_FILENAME, SAVE]);
        done();
      }
    );
  });
});
