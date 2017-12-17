import { ActionsObservable } from "redux-observable";

import { saveConfigOnChangeEpic } from "../../../src/notebook/epics/config";

describe("saveConfigOnChangeEpic", () => {
  test("invokes a SAVE when the SET_CONFIG_KEY action happens", done => {
    const action$ = ActionsObservable.of({ type: "SET_CONFIG_KEY" });
    const responseActions = saveConfigOnChangeEpic(action$);
    responseActions.subscribe(
      x => {
        expect(x).toEqual({ type: "SAVE_CONFIG" });
        done();
      },
      err => done.fail(err)
    );
  });
});
