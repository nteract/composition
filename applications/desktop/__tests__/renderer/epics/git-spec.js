jest.mock("fs");
import { ActionsObservable } from "redux-observable";

import {
  actions,
  createContentRef,
  makeNotebookContentRecord
} from "@nteract/core";

import * as Immutable from "immutable";

import { gitCopyConfigEpic } from "../../../src/notebook/epics/git";

import { of } from "rxjs/observable/of";
import { catchError, toArray } from "rxjs/operators";

describe("gitCopyConfigEpic", () => {
  test("copies global git config to local git config", async function() {
    const contentRef = "123";
    const notificationSystem = { addNotification: jest.fn() };

    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        app: Immutable.Map({
          version: "0.0.0-test",
          notificationSystem
        }),
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map({
                "123": makeNotebookContentRecord()
              })
            },
            kernels: {
              byRef: Immutable.Map({
                k1: {}
              })
            }
          }
        }
      })
    };

    const responses = await gitCopyConfigEpic(
      ActionsObservable.of(actions.gitCopyConfig({ contentRef })),
      store
    )
      .pipe(toArray())
      .toPromise();

    // TODO: This should be testing that the mocks for fs were called with the
    // filename and notebook from the state tree

    expect(responses).toEqual([
      actions.gitCopyConfigSuccessful({ contentRef })
    ]);
  });
});
