import chai, { expect } from "chai";

import { ActionsObservable } from "redux-observable";

import epics, { retryAndEmitError } from "../../../src/notebook/epics";

const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("epics", () => {
  it("is an array of epics", () => {
    expect(epics).to.be.an.array;

    const action$ = new ActionsObservable();
    epics.map(epic => epic(action$));
  });
});

describe("retryAndEmitError", () => {
  it("returns the source observable, emitting an error action first", () => {
    const source = {
      startWith: sinon.stub()
    };
    source.startWith.returns(source);
    const err = new Error("Oh no!");
    const newSource = retryAndEmitError(err, source);

    expect(source.startWith.calledOnce).to.equal(true);
    expect(source.startWith).to.have.been.calledWith({
      payload: err,
      error: true,
      type: "ERROR"
    });

    expect(newSource).to.equal(source);
  });
});
