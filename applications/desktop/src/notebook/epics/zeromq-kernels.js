/* @flow strict */

import type { ChildProcess } from "child_process";

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";

import { sample } from "lodash";

import {
  filter,
  map,
  tap,
  mergeMap,
  catchError,
  switchMap,
  concatMap,
  timeout,
  first
} from "rxjs/operators";

import { launchSpec } from "spawnteract";

import { ActionsObservable, ofType } from "redux-observable";

import { ipcRenderer as ipc } from "electron";

import { createMainChannel } from "enchannel-zmq-backend";
import * as jmp from "jmp";

import { selectors, actions, actionTypes } from "@nteract/core";

import type {
  KernelspecInfo,
  KernelRef,
  ContentRef,
  LocalKernelProps
} from "@nteract/core";

import { childOf, ofMessageType, shutdownRequest } from "@nteract/messaging";

/**
 * Instantiate a connection to a new kernel.
 *
 * @param  {KernelInfo}  kernelSpec The kernel specs - name,language, etc
 * @param  {String}  cwd The working directory to launch the kernel in
 */
export function launchKernelObservable(
  kernelSpec: KernelspecInfo,
  cwd: string,
  kernelRef: KernelRef,
  contentRef: ContentRef
) {
  const spec = kernelSpec.spec;

  return Observable.create(observer => {
    launchSpec(spec, { cwd, stdio: ["ignore", "pipe", "pipe"] }).then(c => {
      const { config, spawn, connectionFile } = c;

      // Pick a random color for the kernel to assist in debugging kernels
      const logColor = sample([
        "#404040",
        "#704040",
        "#407040",
        "#404070",
        "#704070",
        "#707040",
        "#407070",
        "#707070"
      ]);

      const logStd = text => {
        console.log(
          `%c${text}`,
          `color: ${logColor}; font-family: Source Code Pro, courier;`
        );
      };

      console.log(
        `\n>>>> %cLogging kernel ${
          kernelSpec.name
        } (ref ${kernelRef}) stdout and stderr to javascript console in %cthis color %c  %c <<<<\n`,
        `font-weight: bold;`,
        `color: ${logColor}; font-weight: bold;`,
        `background-color: ${logColor}; padding: 2px;`,
        `color: black`
      );

      spawn.stdout.on("data", data => {
        const text = data.toString();
        logStd(text);
        observer.next(actions.kernelRawStdout({ text, kernelRef }));
      });
      spawn.stderr.on("data", data => {
        const text = data.toString();
        logStd(text);
        observer.next(actions.kernelRawStderr({ text, kernelRef }));
      });

      // do dependency injection of jmp to make it match our ABI version of node
      createMainChannel(config, undefined, undefined, jmp)
        .then((channels: Channels) => {
          observer.next(
            actions.setKernelspecInfo({
              kernelInfo: kernelSpec,
              contentRef: contentRef
            })
          );

          const kernel: LocalKernelProps = {
            kernelRef,
            info: null,
            type: "zeromq",
            hostRef: null,
            channels,
            connectionFile,
            spawn,
            cwd,
            kernelSpecName: kernelSpec.name,
            lastActivity: null,
            status: "launched" // TODO: Determine our taxonomy
          };

          observer.next(
            actions.launchKernelSuccessful({
              kernel,
              kernelRef,
              contentRef,
              selectNextKernel: true
            })
          );
          // TODO: Request status right after
          observer.next(
            actions.setExecutionState({ kernelStatus: "launched", kernelRef })
          );
          observer.complete();
        })
        .catch(error => {
          observer.error({ type: "ERROR", payload: error, err: true });
        });
    });
  });
}

/**
 * Get kernel specs from main process
 *
 * @returns  {Observable}  The reply from main process
 */
export const kernelSpecsObservable = Observable.create(observer => {
  ipc.on("kernel_specs_reply", (event, specs) => {
    observer.next(specs);
    observer.complete();
  });
  ipc.send("kernel_specs_request");
});

export const launchKernelByNameEpic = (
  action$: ActionsObservable<*>
): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_BY_NAME),
    tap((action: actionTypes.LaunchKernelByNameAction) => {
      if (!action.payload.kernelSpecName) {
        throw new Error("launchKernelByNameEpic requires a kernel name");
      }
    }),
    mergeMap((action: actionTypes.LaunchKernelByNameAction) =>
      kernelSpecsObservable.pipe(
        mergeMap(specs =>
          // Defer to a launchKernel action to _actually_ launch
          of(
            actions.launchKernel({
              kernelSpec: specs[action.payload.kernelSpecName],
              kernelType: "zeromq",
              cwd: action.payload.cwd,
              kernelRef: action.payload.kernelRef,
              selectNextKernel: action.payload.selectNextKernel,
              contentRef: action.payload.contentRef
            })
          )
        )
      )
    )
  );

/**
 * Launches a new kernel.
 *
 * @param  {ActionObservable} action$  ActionObservable for LAUNCH_KERNEL action
 */
export const launchKernelEpic = (
  action$: ActionsObservable<*>,
  store: *
): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL),
    // We must kill the previous kernel now
    // Then launch the next one
    switchMap((action: actionTypes.LaunchKernelAction) => {
      if (
        !action.payload ||
        !action.payload.kernelSpec ||
        !action.payload.kernelRef
      ) {
        return of(
          actions.launchKernelFailed({
            error: new Error("launchKernel needs a kernelSpec and a kernelRef"),
            kernelRef: action.payload && action.payload.kernelRef,
            contentRef: action.payload.contentRef
          })
        );
      }

      // TODO: Do the async version of `ipc.send`, potentially coordinate with main process
      ipc.send("nteract:ping:kernel", action.payload.kernelSpec);

      const oldKernelRef = selectors.currentKernelRef(store.getState());

      // Kill the old kernel by emitting the action to kill it if it exists
      let cleanupOldKernel$ = empty();
      if (oldKernelRef && oldKernelRef !== action.payload.kernelRef) {
        cleanupOldKernel$ = of(
          actions.killKernel({ restarting: false, kernelRef: oldKernelRef })
        );
      }

      return merge(
        launchKernelObservable(
          action.payload.kernelSpec,
          action.payload.cwd,
          action.payload.kernelRef,
          action.payload.contentRef
        ),
        // Was there a kernel before (?) -- kill it if so, otherwise nothing else
        cleanupOldKernel$
      ).pipe(
        catchError((error: Error) =>
          of(
            actions.launchKernelFailed({
              error,
              kernelRef: action.payload.kernelRef,
              contentRef: action.payload.contentRef
            })
          )
        )
      );
    }),
    // TODO: ask @jayphelps about `merge(of(errorAction), source)` replaying the
    // original action
    catchError((error: Error) => {
      return of({ type: "ERROR", payload: error, error: true });
    })
  );

export const interruptKernelEpic = (action$: *, store: *): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.INTERRUPT_KERNEL),
    // This epic can only interrupt direct zeromq connected kernels
    filter(() => selectors.isCurrentKernelZeroMQ(store.getState())),
    // If the user fires off _more_ interrupts, we shouldn't interrupt the in-flight
    // interrupt, instead doing it after the last one happens
    concatMap((action: actionTypes.InterruptKernel) => {
      const kernel = selectors.currentKernel(store.getState());
      if (!kernel) {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Can't interrupt a kernel we don't have"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      if (kernel.type !== "zeromq" || !kernel.spawn) {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Invalid kernel type for interrupting"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      const spawn = kernel.spawn;

      //
      // From the node.js docs
      //
      // > The ChildProcess object may emit an 'error' event if the signal cannot be delivered.
      //
      // This is instead handled in the watchSpawnEpic below
      spawn.kill("SIGINT");

      return of(
        actions.interruptKernelSuccessful({
          kernelRef: action.payload.kernelRef
        })
      );
    })
  );

function killSpawn(spawn: *): void {
  // Clean up all the terminal streams
  // "pause" stdin, which puts it back in its normal state
  // $FlowFixMe - Flow's built-in definitions are missing pause
  if (spawn.stdin && kernel.spawn.stdin.pause) {
    // $FlowFixMe - Flow's built-in definitions are missing pause
    spawn.stdin.pause();
  }
  // $FlowFixMe - Flow's built-in definitions are missing destroy
  spawn.stdout.destroy();
  // $FlowFixMe - Flow's built-in definitions are missing destroy
  spawn.stderr.destroy();

  // Kill the process fully
  spawn.kill("SIGKILL");
}

// This might be better named shutdownKernel because it first attempts a graceful
// shutdown by sending a shutdown msg to the kernel, and only if the kernel
// doesn't respond promptly does it SIGKILL the kernel.
export const killKernelEpic = (action$: *, store: *): Observable<Action> =>
  action$.pipe(
    ofType(actionTypes.KILL_KERNEL),
    concatMap((action: actionTypes.KillKernelAction) => {
      const state = store.getState();
      const kernelRef = action.payload.kernelRef;
      const kernel = selectors.kernel(state, { kernelRef });

      if (!kernel) {
        console.warn("tried to kill a kernel that doesn't exist");
        return empty();
      }

      // Ignore the action if the specified kernel is not ZMQ.
      if (kernel.type !== "zeromq") {
        return empty();
      }

      const request = shutdownRequest({ restart: false });

      // Try to make a shutdown request
      // If we don't get a response within X time, force a shutdown
      // Either way do the same cleanup
      // $FlowFixMe: revisite when upgrading to rxjs@6
      const shutDownHandling = kernel.channels.pipe(
        childOf(request),
        ofMessageType("shutdown_reply"),
        first(),
        // If we got a reply, great! :)
        map(msg =>
          actions.shutdownReplySucceeded({ text: msg.content, kernelRef })
        ),
        // If we don't get a response within 2s, assume failure :(
        timeout(1000 * 2),
        catchError(err =>
          of(actions.shutdownReplyTimedOut({ error: err, kernelRef }))
        ),
        mergeMap(action => {
          // End all communication on the channels
          kernel.channels.complete();

          if (kernel.spawn) {
            killSpawn(kernel.spawn);
          }

          return merge(
            // Pass on our intermediate action (whether or not kernel ACK'd shutdown request promptly)
            of(action),
            // Indicate overall success (channels cleaned up)
            of(
              actions.killKernelSuccessful({
                kernelRef: kernelRef
              })
            ),
            // Inform about the state
            of(
              actions.setExecutionState({
                kernelStatus: "shutting down",
                kernelRef
              })
            )
          );
        }),
        catchError(err =>
          // Catch all, in case there were other errors here
          of(actions.killKernelFailed({ error: err, kernelRef }))
        )
      );

      // On subscription, send the message
      return Observable.create(observer => {
        const subscription = shutDownHandling.subscribe(observer);
        kernel.channels.next(request);
        return subscription;
      });
    })
  );

export function watchSpawn(action$: *) {
  return action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: actionTypes.NewKernelAction) => {
      if (!action.payload.kernel.type === "zeromq") {
        throw new Error("kernel.type is not zeromq.");
      }
      // $FlowFixMe: spawn's type seems not to be defined.
      if (!action.payload.kernel.spawn) {
        throw new Error("kernel.spawn is not provided.");
      }
      const spawn: ChildProcess = action.payload.kernel.spawn;
      return Observable.create(observer => {
        spawn.on("error", error => {
          // We both set the state and make it easy for us to log the error
          observer.next(
            actions.setExecutionState({
              kernelStatus: "process errored",
              kernelRef: action.payload.kernelRef
            })
          );
          observer.error({ type: "ERROR", payload: error, err: true });
          observer.complete();
        });
        spawn.on("exit", () => {
          observer.next(
            actions.setExecutionState({
              kernelStatus: "process exited",
              kernelRef: action.payload.kernelRef
            })
          );
          observer.complete();
        });
        spawn.on("disconnect", () => {
          observer.next(
            actions.setExecutionState({
              kernelStatus: "process disconnected",
              kernelRef: action.payload.kernelRef
            })
          );
          observer.complete();
        });
      });
    })
  );
}
