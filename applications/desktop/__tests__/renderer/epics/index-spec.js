import { ActionsObservable } from "redux-observable";

import epics, { retryAndEmitError } from "../../../src/notebook/epics";

describe("epics", () => {
  test("is an array of epics", () => {
    expect(Array.isArray(epics)).toBe(true);

    const action$ = new ActionsObservable();
    const mapped = epics.map(epic => epic(action$));
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
