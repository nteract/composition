/* @flow */

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { merge } from "rxjs/observable/merge";

import {
  filter,
  map,
  tap,
  mergeMap,
  catchError,
  first,
  pluck,
  switchMap
} from "rxjs/operators";

import { launchSpec } from "spawnteract";

import { ActionsObservable, ofType } from "redux-observable";

import * as uuid from "uuid";

import { ipcRenderer as ipc } from "electron";

import { createMainChannel } from "enchannel-zmq-backend";
import * as jmp from "jmp";

import type {
  LanguageInfoMetadata,
  KernelInfo
} from "@nteract/types/core/records";

import type { Channels } from "@nteract/types/channels";

import { createMessage, childOf, ofMessageType } from "@nteract/messaging";

import {
  setExecutionState,
  setNotebookKernelInfo,
  activateKernel
} from "@nteract/core/actions";

import {
  ACTIVATE_KERNEL,
  ACTIVATE_KERNEL_BY_NAME,
  SET_LANGUAGE_INFO,
  ERROR_KERNEL_LAUNCH_FAILED,
  KERNEL_RAW_STDOUT,
  KERNEL_RAW_STDERR
} from "@nteract/core/constants";

export function setLanguageInfo(langInfo: LanguageInfoMetadata) {
  return {
    type: SET_LANGUAGE_INFO,
    langInfo
  };
}

/**
 * Send a kernel_info_request to the kernel.
 *
 * @param  {Object}  channels  A object containing the kernel channels
 * @returns  {Observable}  The reply from the server
 */
export function acquireKernelInfo(channels: Channels) {
  const message = createMessage("kernel_info_request");

  const obs = channels.pipe(
    childOf(message),
    ofMessageType("kernel_info_reply"),
    first(),
    pluck("content", "language_info"),
    map(setLanguageInfo)
  );

  return Observable.create(observer => {
    const subscription = obs.subscribe(observer);
    channels.next(message);
    return subscription;
  });
}

/**
 * Instantiate a connection to a new kernel.
 *
 * @param  {KernelInfo}  kernelSpec The kernel specs - name,language, etc
 * @param  {String}  cwd The working directory to launch the kernel in
 */
export function newKernelObservable(kernelSpec: KernelInfo, cwd: string) {
  const spec = kernelSpec.spec;

  return Observable.create(observer => {
    launchSpec(spec, { cwd, stdio: ["ignore", "pipe", "pipe"] }).then(c => {
      const { config, spawn, connectionFile } = c;
      const kernelSpecName = kernelSpec.name;

      spawn.stdout.on("data", data => {
        const action = { type: KERNEL_RAW_STDOUT, payload: data.toString() };
        observer.next(action);
      });
      spawn.stderr.on("data", data => {
        const action = { type: KERNEL_RAW_STDERR, payload: data.toString() };
        observer.next(action);
      });

      // do dependency injection of jmp to make it match our ABI version of node
      createMainChannel(config, undefined, undefined, jmp)
        .then(channels => {
          observer.next(setNotebookKernelInfo(kernelSpec));

          observer.next({
            type: ACTIVATE_KERNEL,
            payload: {
              channels,
              connectionFile,
              spawn,
              kernelSpecName,
              kernelSpec
            }
          });
        })
        .catch(error => {
          observer.error({ type: "ERROR", payload: error, err: true });
        });

      spawn.on("error", error => {
        observer.error({ type: "ERROR", payload: error, err: true });
        observer.complete();
      });

      spawn.on("exit", () => {
        observer.complete();
      });
      spawn.on("disconnect", () => {
        observer.complete();
      });
    });
  });
}

/**
 * Sets the execution state after a kernel has been launched.
 *
 * @oaram  {ActionObservable}  action$ ActionObservable for ACTIVATE_KERNEL action
 */
export const watchExecutionStateEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(ACTIVATE_KERNEL),
    switchMap(action =>
      merge(
        action.channels.pipe(
          filter(msg => msg.header.msg_type === "status"),
          map(msg => setExecutionState(msg.content.execution_state))
        ),
        of(setExecutionState("idle"))
      )
    )
  );
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

/**
 * Gets information about newly launched kernel.
 *
 * @param  {ActionObservable}  The action type
 */
export const acquireKernelInfoEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(ACTIVATE_KERNEL),
    switchMap(action => {
      /* istanbul ignore if -- used for interactive debugging */
      if (process.env.DEBUG) {
        window.channels = action.channels;
      }
      return acquireKernelInfo(action.channels);
    })
  );

export const newKernelByNameEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(ACTIVATE_KERNEL_BY_NAME),
    tap(action => {
      if (!action.kernelSpecName) {
        throw new Error("newKernelByNameEpic requires a kernel name");
      }
    }),
    mergeMap(action =>
      kernelSpecsObservable.pipe(
        mergeMap(specs =>
          of(activateKernel(specs[action.kernelSpecName], action.cwd))
        )
      )
    )
  );

/**
 * Launches a new kernel.
 *
 * @param  {ActionObservable} action$  ActionObservable for ACTIVATE_KERNEL action
 */
export const newKernelEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(ACTIVATE_KERNEL),
    tap(action => {
      if (!action.kernelSpec) {
        throw new Error("activateKernel needs a kernelSpec");
      }
      ipc.send("nteract:ping:kernel", action.kernelSpec);
    }),
    mergeMap(action => newKernelObservable(action.kernelSpec, action.cwd)),
    catchError((error, source) =>
      merge(
        of({
          type: ERROR_KERNEL_LAUNCH_FAILED,
          payload: error,
          error: true
        }),
        source
      )
    )
  );
