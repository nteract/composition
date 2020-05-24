import {
  actions as coreActions,
  makeDocumentRecord,
  makeNotebookContentRecord,
  state as stateModule
} from "@nteract/core";
import * as Immutable from "immutable";
import { of } from "rxjs";

import { toArray } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";

import { ipcRenderer as ipc } from "../../../__mocks__/electron";
import * as actions from "../../../src/notebook/actions";
import { closeNotebookEpic } from "../../../src/notebook/epics/close-notebook";
import {
  DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED,
  DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
} from "../../../src/notebook/state";

jest.mock("fs");

const buildScheduler = () =>
  new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

const buildState = (dirty: boolean = false) => ({
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
});

describe("closeNotebookEpic", () => {
  describe("when notebook is dirty, prompts user to abort", () => {
    test("and allows continuing", async () => {
      let registeredCallback;
      ipc.once = (event, callback) => {
        if (event === "show-message-box-response") {
          registeredCallback = callback;
        }
      };
      ipc.send = (event, data) => {
        expect(event).toBe("show-message-box");
        expect(data.message).toEqual(
          "Unsaved data will be lost. Are you sure you want to quit?"
        );

        // "Yes"
        registeredCallback("dummy-event", 0);
      };

      const state = buildState(true);
      const responses = await closeNotebookEpic(
        of(
          actions.closeNotebook({ contentRef: "contentRef1" })
        ),
        { value: state }
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
      let registeredCallback;
      ipc.once = (event, callback) => {
        if (event === "show-message-box-response") {
          registeredCallback = callback;
        }
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

      const state = buildState(true);
      const responses = await closeNotebookEpic(
        of(
          actions.closeNotebook({ contentRef: "contentRef1" })
        ),
        { value: state }
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
      const state = buildState(false);

      const testScheduler = buildScheduler();

      testScheduler.run(helpers => {
        const { hot, expectObservable } = helpers;
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

        const inputAction$ = hot(inputMarbles, inputActions);
        const outputAction$ = closeNotebookEpic(inputAction$, { value: state });

        expectObservable(outputAction$).toBe(outputMarbles, outputActions);
      });
    });

    test("promptly continue when KILL_KERNEL fails", async () => {
      const state = buildState(false);

      const testScheduler = buildScheduler();

      testScheduler.run(helpers => {
        const { hot, expectObservable } = helpers;
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

        const inputAction$ = hot(inputMarbles, inputActions);
        const outputAction$ = closeNotebookEpic(inputAction$, { value: state });

        expectObservable(outputAction$).toBe(outputMarbles, outputActions);
      });
    });

    test("continue after a timeout period when no KILL_KERNEL result is received", async () => {
      const state = buildState(false);

      const testScheduler = buildScheduler();

      testScheduler.run(helpers => {
        const { hot, expectObservable } = helpers;
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

        const inputMarbles = "a          6000ms |";
        const outputMarbles = "c 4999ms d 1000ms |"; // Timeout after 5s

        const inputAction$ = hot(inputMarbles, inputActions);

        const outputAction$ = closeNotebookEpic(inputAction$, { value: state });

        expectObservable(outputAction$).toBe(outputMarbles, outputActions);
      });
    });
  });

  test("update close progress state and trigger window.close", async () => {
    const state = buildState(false);

    const testScheduler = buildScheduler();
    testScheduler.run(helpers => {
      const { hot, expectObservable } = helpers;
      const inputActions = {
        a: actions.closeNotebook({
          contentRef: "contentRef1",
          reloading: false
        }),
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

      const inputAction$ = hot(inputMarbles, inputActions);
      const outputAction$ = closeNotebookEpic(inputAction$, { value: state });

      expectObservable(outputAction$).toBe(outputMarbles, outputActions);

      expect(window.close).toBeCalled();
    });
  });
});
