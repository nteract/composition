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
    const source = { startWith: jest.fn(() => source) };
    const err = new Error("Oh no!");
    const newSource = retryAndEmitError(err, source);

    expect(source.startWith).toHaveBeenCalledTimes(1);
    expect(source.startWith).toHaveBeenCalledWith({
      payload: err,
      error: true,
      type: "ERROR"
    });

    expect(newSource).toBe(source);
  });
});
