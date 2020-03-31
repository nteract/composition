import { mockAppState } from "@nteract/fixtures";
import { StateObservable } from "redux-observable";
import { Observable, Subject } from "rxjs";

import epics, { retryAndEmitError } from "../../../src/notebook/epics";

describe("epics", () => {
  test("is an array of epics", () => {
    expect(Array.isArray(epics)).toBe(true);

    const action$ = new Observable();
    const state$ = new StateObservable(new Subject(), mockAppState({}));
    const mapped = epics.map(epic => epic(action$, state$));
    expect(Array.isArray(mapped)).toBe(true);
  });
});

describe("retryAndEmitError", () => {
  test("returns the source observable, emitting an error action first", () => {
    console.error = jest.fn();

    const source = {
      pipe: jest.fn()
    };

    const err = new Error("Oh no!");
    retryAndEmitError(err, source);

    expect(console.error).toHaveBeenCalledWith(err);

    expect(source.pipe).toHaveBeenCalledTimes(1);
    expect(source.pipe).toHaveBeenCalledWith(expect.any(Function));
  });
});
