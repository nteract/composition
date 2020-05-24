import { actions, makeAppRecord } from "@nteract/core";
import { mockAppState } from "@nteract/fixtures";
import { StateObservable } from "redux-observable";
import { publishEpic } from "../../../src/notebook/epics/github-publish";

import { of, Subject } from "rxjs";
import { toArray } from "rxjs/operators";

describe("publishEpic", () => {
  it("does nothing if no content ref is provided", done => {
    const action$ = of(
      actions.publishGist({ contentRef: undefined })
    );
    const state$ = new StateObservable(new Subject(), {});
    const obs = publishEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([]);
      },
      err => done.fail(err),
      () => done()
    );
  });
  it("does nothing if there is no content", done => {
    const action$ = of(
      actions.publishGist({ contentRef: "" })
    );
    const state$ = new StateObservable(new Subject(), {});
    const obs = publishEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual([]);
      },
      err => done.fail(err),
      () => done()
    );
  });
  it("emits an error if no GitHub token is provided", (done) => {
    const state = mockAppState({});
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const action$ = of(actions.publishGist({ contentRef }));
    const state$ = new StateObservable(new Subject(), state);
    const obs = publishEpic(action$, state$);
    obs.pipe(toArray()).subscribe(
      action => {
        const types = action.map(({ type }) => type);
        expect(types).toEqual(["notifications/sendNotification", "CORE/ERROR"]);
      },
      err => done.fail(err),
      () => done()
    );
  });
});
