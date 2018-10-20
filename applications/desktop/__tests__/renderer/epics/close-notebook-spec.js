/* @flow strict */

import * as actions from "../../../src/notebook/actions";

import {
  DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED,
  DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
} from "../../../src/notebook/state.js";

import { closeNotebookEpic } from "../../../src/notebook/epics/close-notebook";

import {
  actions as coreActions,
  makeDocumentRecord,
  makeNotebookContentRecord,
  state as stateModule
} from "@nteract/core";

import * as Immutable from "immutable";

import { toArray } from "rxjs/operators";
import { ActionsObservable } from "redux-observable";

import { ipcRenderer as ipc } from "../../../__mocks__/electron";

import { TestScheduler } from "rxjs/testing/TestScheduler";

const buildScheduler = () =>
  new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

const buildStore = (dirty: boolean = false) => {
  return {
    dispatch: jest.fn(),
    getState: () => ({
      core: {
        entities: {
          contents: {
            byRef: Immutable.Map({
              contentRef1: makeNotebookContentRecord({
                model: makeDocumentRecord({
                  notebook: "content",
                  savedNotebook: dirty ? "content-MODIFIED" : "content"
                })
              })
            })
          },
          kernels: {
            byRef: Immutable.Map({
              kernelRef1: stateModule.makeRemoteKernelRecord({
                type: "zeromq"
              }),
              kernelRef2: stateModule.makeRemoteKernelRecord({
                type: "not-zeromq"
              })
            })
          }
        }
      }
    })
  };
};

describe("closeNotebookEpic", () => {
  describe("when notebook is dirty, prompts user to abort", () => {
    test("and allows continuing", async () => {
      var registeredCallback;
      ipc.once = (event, callback) => {
        if (event == "show-message-box-response") registeredCallback = callback;
      };
      ipc.send = (event, data) => {
        expect(event).toBe("show-message-box");
        expect(data.message).toEqual(
          "Unsaved data will be lost. Are you sure you want to quit?"
        );

        // "Yes"
        registeredCallback("dummy-event", 0);
      };

      const store = buildStore(true);
      const responses = await closeNotebookEpic(
        ActionsObservable.of(
          actions.closeNotebook({ contentRef: "contentRef1" })
        ),
        store
      )
        .pipe(toArray())
        .toPromise();

      expect(responses).toEqual([
        coreActions.killKernel({ kernelRef: "kernelRef1", restarting: false }),
        actions.closeNotebookProgress({
          newState: DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
        })
      ]);
    });

    test("and allows aborting, triggering IPC close-notebook-canceled for app-wide quit orchestration", async () => {
      var registeredCallback;
      ipc.once = (event, callback) => {
        if (event == "show-message-box-response") registeredCallback = callback;
      };
      ipc.send = (event, data) => {
        expect(event).toBe("show-message-box");
        expect(data.message).toEqual(
          "Unsaved data will be lost. Are you sure you want to quit?"
        );

        // Next expected message:
        ipc.send = event => {
          expect(event).toBe("close-notebook-canceled");
        };

        // "No"
        registeredCallback("dummy-event", 1);
      };

      const store = buildStore(true);
      const responses = await closeNotebookEpic(
        ActionsObservable.of(
          actions.closeNotebook({ contentRef: "contentRef1" })
        ),
        store
      )
        .pipe(toArray())
        .toPromise();

      // Closing state reset back to starting value
      expect(responses).toEqual([
        actions.closeNotebookProgress({
          newState: DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED
        })
      ]);
    });
  });

  describe("kill kernels", () => {
    test("promptly continue when KILL_KERNEL is successful", async () => {
      const store = buildStore(false);

      const testScheduler = buildScheduler();

      const inputActions = {
        a: actions.closeNotebook({ contentRef: "contentRef1" }),
        b: coreActions.killKernelSuccessful({ kernelRef: "kernelRef1" })
      };

      const outputActions = {
        c: coreActions.killKernel({
          kernelRef: "kernelRef1",
          restarting: false
        }),
        d: actions.closeNotebookProgress({
          newState: DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
        })
      };

      const inputMarbles = "a b";
      const outputMarbles = "c d";

      const inputAction$ = new ActionsObservable(
        testScheduler.createHotObservable(inputMarbles, inputActions)
      );
      const outputAction$ = closeNotebookEpic(inputAction$, store);

      testScheduler
        .expectObservable(outputAction$)
        .toBe(outputMarbles, outputActions);
      testScheduler.flush();
    });

    test("promptly continue when KILL_KERNEL fails", async () => {
      const store = buildStore(false);

      const testScheduler = buildScheduler();

      const inputActions = {
        a: actions.closeNotebook({ contentRef: "contentRef1" }),
        b: coreActions.killKernelFailed({
          kernelRef: "kernelRef1",
          error: new Error("barf")
        })
      };

      const outputActions = {
        c: coreActions.killKernel({
          kernelRef: "kernelRef1",
          restarting: false
        }),
        d: actions.closeNotebookProgress({
          newState: DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
        })
      };

      const inputMarbles = "a b";
      const outputMarbles = "c d";

      const inputAction$ = new ActionsObservable(
        testScheduler.createHotObservable(inputMarbles, inputActions)
      );
      const outputAction$ = closeNotebookEpic(inputAction$, store);

      testScheduler
        .expectObservable(outputAction$)
        .toBe(outputMarbles, outputActions);
      testScheduler.flush();
    });

    test("continue after a timeout period when no KILL_KERNEL result is received", async () => {
      const store = buildStore(false);

      const testScheduler = buildScheduler();

      const inputActions = {
        a: actions.closeNotebook({ contentRef: "contentRef1" })
      };

      const outputActions = {
        c: coreActions.killKernel({
          kernelRef: "kernelRef1",
          restarting: false
        }),
        d: actions.closeNotebookProgress({
          newState: DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
        })
      };

      // Unable to get TestScheduler to honor timeout() in the epic, even after
      // trying the work-arounds specified in https://github.com/redux-observable/redux-observable/issues/180
      // Let's wait for rsjs 6 and try again.
      // In the meantime I've manually confirmed that the full desktop app correctly times out.
      //      const inputMarbles =  "a" + "-".repeat(6000) + "";
      //      const outputMarbles = "c" + "-".repeat(5000) + "d";

      const inputMarbles = "a |"; // Must explicitly complete (`|`) our input observable; believe this is related to the timeout() issue
      const outputMarbles = "c (d|)";

      const inputAction$ = new ActionsObservable(
        testScheduler.createHotObservable(inputMarbles, inputActions)
      );
      const outputAction$ = closeNotebookEpic(
        inputAction$,
        store,
        testScheduler
      );

      testScheduler
        .expectObservable(outputAction$)
        .toBe(outputMarbles, outputActions);
      testScheduler.flush();
    });
  });

  test("update close progress state and trigger window.close", async () => {
    window.close = jest.fn();

    const store = buildStore(false);
    const responses = await closeNotebookEpic(
      ActionsObservable.of(
        actions.closeNotebook({ contentRef: "contentRef1" })
      ),
      store
    )
      .pipe(toArray())
      .toPromise();

    expect(responses).toEqual([
      coreActions.killKernel({ kernelRef: "kernelRef1", restarting: false }),
      actions.closeNotebookProgress({
        newState: DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
      })
    ]);

    expect(window.close).toBeCalled();
  });
});
