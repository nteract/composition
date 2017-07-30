import commsReducer from "../../../src/notebook/reducers/comms";
import { CommsRecord } from "../../../src/notebook/records";

const chai = require("chai");
const chaiImmutable = require("chai-immutable");

chai.use(chaiImmutable);

const expect = chai.expect;

describe("registerCommTarget", () => {
  it("sets comm targets", () => {
    const state = new CommsRecord();

    const action = {
      type: "REGISTER_COMM_TARGET",
      name: "steve",
      handler: "?????"
    };

    const nextState = commsReducer(state, action);
    expect(nextState).to.deep.equal(state.setIn(["targets", "steve"], "?????"));
  });
});

describe("comm reducers", () => {
  it("process comm_open and comm_message actions", () => {
    const state = new CommsRecord();
    const action = {
      type: "COMM_OPEN",
      target_module: "reducers",
      target_name: "setIn",
      data: { a: 2 },
      comm_id: 100
    };

    const nextState = commsReducer(state, action);
    expect(nextState.getIn(["info", 100]).toJS()).to.deep.equal({
      target_module: "reducers",
      target_name: "setIn"
    });

    expect(nextState.getIn(["models", 100]).toJS()).to.deep.equal({
      a: 2
    });

    const actionMessage = {
      type: "COMM_MESSAGE",
      data: {
        path: ["a"],
        value: 3
      },
      comm_id: 100
    };

    const afterMessageState = commsReducer(nextState, actionMessage);

    expect(afterMessageState.getIn(["models", 100]).toJS()).to.deep.equal({
      a: 3
    });
  });
  it("does a straight replacement for unknown comm messages", () => {
    const state = new CommsRecord();

    // Note that we're not starting with a COMM_OPEN in order to process
    // a COMM_MESSAGE that hasn't been "opened"
    const action = {
      type: "COMM_MESSAGE",
      data: {
        x: 5113,
        bagels: true
      },
      comm_id: 101
    };

    const nextState = commsReducer(state, action);

    expect(nextState.getIn(["models", 101]).toJS()).to.deep.equal({
      bagels: true,
      x: 5113
    });
  });
});
