jest.mock("fs");
import { ActionsObservable } from "redux-observable";

import {
  actions,
  createContentRef,
  makeNotebookContentRecord
} from "@nteract/core";

import * as Immutable from "immutable";

import {
  gitCopyConfigEpic,
  gitInitEpic,
  gitAddEpic,
  gitRemoveEpic
} from "../../../src/notebook/epics/git";

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

describe("gitInitEpic", () => {
  test("instantiates a git repository", async function() {
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

    await gitInitEpic(
      ActionsObservable.of(actions.gitInit({ contentRef })),
      store
    )
      .pipe(toArray())
      .subscribe(actions => {
        expect(actions).to.deep.equal([
          actions.gitInitSuccessful({ contentRef })
        ]);
        done();
      });
  });
});

describe("gitAddEpic", () => {
  test("stages notebook", async function() {
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

    await gitAddEpic(
      ActionsObservable.of(actions.gitAdd({ contentRef })),
      store
    )
      .pipe(toArray())
      .subscribe(actions => {
        expect(actions).to.deep.equal([
          actions.gitAddSuccessful({ contentRef })
        ]);
        done();
      });
  });
});

describe("gitRemoveEpic", () => {
  test("removes notebook", async function() {
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

    await gitRemoveEpic(
      ActionsObservable.of(actions.gitRemove({ contentRef })),
      store
    )
      .pipe(toArray())
      .subscribe(actions => {
        expect(actions).to.deep.equal([
          actions.gitRemoveSuccessful({ contentRef })
        ]);
        done();
      });
  });
});
