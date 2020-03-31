import { actions as coreActions, DocumentRecordProps, selectors } from "@nteract/core";

import { KernelRecord, KernelRef } from "@nteract/types";
import { ipcRenderer as ipc } from "electron";
import { RecordOf } from "immutable";
import { ofType, StateObservable } from "redux-observable";
import { concat, empty, Observable, Observer, of, zip } from "rxjs";
import { catchError, concatMap, exhaustMap, filter, take, tap, timeout } from "rxjs/operators";

import * as actions from "../actions";
import { Actions } from "../actions";
import { CLOSE_NOTEBOOK, CloseNotebook } from "../actionTypes";
import { DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED, DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE, DesktopNotebookAppState } from "../state";

export const closeNotebookEpic = (
  action$: Observable<any>,
  state$: StateObservable<DesktopNotebookAppState>
) =>
  action$.pipe(
    ofType(CLOSE_NOTEBOOK),
    exhaustMap((action: CloseNotebook) => {
      const contentRef = action.payload.contentRef;
      const state = state$.value;
      const model = selectors.model(state, {
        contentRef
      }) as RecordOf<DocumentRecordProps>;

      let dirtyPromptObservable: Observable<boolean>;
      if (selectors.notebook.isDirty(model)) {
        dirtyPromptObservable = Observable.create((observer: Observer<any>) => {
          const promptDialog = {
            type: "question",
            buttons: ["Quit", "Cancel"],
            title: "Confirm",
            message: "Unsaved data will be lost. Are you sure you want to quit?"
          };
          ipc.once(
            "show-message-box-response",
            (_event: string, arg: number) => {
              observer.next(arg === 0);
              observer.complete();
            }
          );
          ipc.send("show-message-box", promptDialog);
        });
      } else {
        dirtyPromptObservable = of(true);
      }

      const killKernelActions: Actions[] = [];
      const killKernelAwaits: Array<Observable<Actions>> = [];
      state.core.entities.kernels.byRef.forEach(
        (kernel: KernelRecord, kernelRef: KernelRef) => {
          // Skip if kernel unknown
          if (!kernel || !kernel.type) {
            return;
          }

          if (kernel.type === "zeromq") {
            killKernelActions.push(
              coreActions.killKernel({
                restarting: false,
                kernelRef
              })
            );

            killKernelAwaits.push(
              action$.pipe(
                ofType(
                  coreActions.KILL_KERNEL_SUCCESSFUL,
                  coreActions.KILL_KERNEL_FAILED
                ),
                filter(
                  (
                    action:
                      | coreActions.KillKernelSuccessful
                      | coreActions.KillKernelFailed
                  ) => action.payload.kernelRef === kernelRef
                ),
                take(1)
              )
            );
          } else if (kernel.type === "websocket") {
            console.log(
              "Need to implement a way to shutdown websocket kernels on desktop"
            );
          }
        }
      );

      const killKernels = of(...killKernelActions);

      const awaitKillKernelResults = zip(...killKernelAwaits).pipe(
        timeout(1000 * 5), // This should be at least as long as the timeout used to wait for kernel to reply to shutdown msgs
        tap(result => {
          for (const r of result) {
            console.log(JSON.stringify(r)); // To see these in terminal, set ELECTRON_ENABLE_LOGGING=1. Could also start more explicitly routing them to main process stdout.
          }
        }),
        concatMap(() =>
          // We don't need the results. Further, allowing the Array<Action> to flow through error middleware crashed
          // node.js for me, with "Error: async hook stack has become corrupted (actual: 1528, expected: 0)".
          // Seemed related to the error middleware not expecting an Array (returning result[0] avoids the crash as
          // well).
          empty()
        ),
        catchError((error: Error) => {
          console.log(
            "One or more kernels failed to shutdown properly in the allocated time."
          );
          console.log(error.message);
          return empty(); // Just carry on with closing.
        })
      );

      const updateClosingState = of(
        actions.closeNotebookProgress({
          newState: DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE // This is what allows the window to unload
        })
      );

      const initiateClose = Observable.create((observer: Observer<any>) => {
        if (action.payload.reloading) {
          console.log("Kernel shutdown complete; reloading notebook window...");
          ipc.send("reload");
        } else {
          console.log("Kernel shutdown complete; closing notebook window...");
          window.close();
        }

        observer.complete();
      });

      return dirtyPromptObservable.pipe(
        concatMap((proceed: boolean) => {
          if (!proceed) {
            // Cancel any full-app shutdown in flight
            ipc.send("close-notebook-canceled");

            // Reset notebook state to allow another attempt later
            return of(
              actions.closeNotebookProgress({
                newState: DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED
              })
            );
          }

          return concat(
            killKernels,
            awaitKillKernelResults,
            updateClosingState,
            initiateClose
          );
        })
      );
    })
  );
