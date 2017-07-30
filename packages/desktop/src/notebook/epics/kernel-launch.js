/* @flow */

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/observable/merge";

import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/catch";

import { launchSpec } from "spawnteract";

import { ActionsObservable } from "redux-observable";

import * as uuid from "uuid";

import { ipcRenderer as ipc } from "electron";

import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject
} from "enchannel-zmq-backend";

import type { LanguageInfoMetadata, KernelInfo, Channels } from "../records";

import { createMessage } from "@nteract/messaging";

import {
  setExecutionState,
  setNotebookKernelInfo,
  newKernel
} from "../actions";

import {
  NEW_KERNEL,
  LAUNCH_KERNEL,
  LAUNCH_KERNEL_BY_NAME,
  SET_LANGUAGE_INFO,
  ERROR_KERNEL_LAUNCH_FAILED
} from "../constants";

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

  const obs = channels.shell
    .childOf(message)
    .ofMessageType(["kernel_info_reply"])
    .first()
    .pluck("content", "language_info")
    .map(setLanguageInfo);

  return Observable.create(observer => {
    const subscription = obs.subscribe(observer);
    channels.shell.next(message);
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
    launchSpec(spec, { cwd }).then(c => {
      const { config, spawn, connectionFile } = c;
      const kernelSpecName = kernelSpec.name;

      const identity = uuid.v4();
      // TODO: I'm realizing that we could trigger on when the underlying sockets
      //       are ready with these subjects to let us know when the kernels
      //       are *really* ready
      const channels = {
        shell: createShellSubject(identity, config),
        iopub: createIOPubSubject(identity, config),
        control: createControlSubject(identity, config),
        stdin: createStdinSubject(identity, config)
      };
      observer.next(setNotebookKernelInfo(kernelSpec));

      observer.next({
        type: NEW_KERNEL,
        channels,
        connectionFile,
        spawn,
        kernelSpecName,
        kernelSpec
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
  * @oaram  {ActionObservable}  action$ ActionObservable for NEW_KERNEL action
  */
export const watchExecutionStateEpic = (action$: ActionsObservable) =>
  action$
    .ofType(NEW_KERNEL)
    .switchMap(action =>
      Observable.merge(
        action.channels.iopub
          .filter(msg => msg.header.msg_type === "status")
          .map(msg => setExecutionState(msg.content.execution_state)),
        Observable.of(setExecutionState("idle"))
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
export const acquireKernelInfoEpic = (action$: ActionsObservable) =>
  action$.ofType(NEW_KERNEL).switchMap(action => {
    /* istanbul ignore if -- used for interactive debugging */
    if (process.env.DEBUG) {
      window.channels = action.channels;
    }
    return acquireKernelInfo(action.channels);
  });

export const newKernelByNameEpic = (action$: ActionsObservable) =>
  action$
    .ofType(LAUNCH_KERNEL_BY_NAME)
    .do(action => {
      if (!action.kernelSpecName) {
        throw new Error("newKernelByNameEpic requires a kernel name");
      }
    })
    .mergeMap(action =>
      kernelSpecsObservable.mergeMap(specs =>
        Observable.of(newKernel(specs[action.kernelSpecName], action.cwd))
      )
    );

/**
  * Launches a new kernel.
  *
  * @param  {ActionObservable} action$  ActionObservable for LAUNCH_KERNEL action
  */
export const newKernelEpic = (action$: ActionsObservable) =>
  action$
    .ofType(LAUNCH_KERNEL)
    .do(action => {
      if (!action.kernelSpec) {
        throw new Error("newKernel needs a kernelSpec");
      }
      ipc.send("nteract:ping:kernel", action.kernelSpec);
    })
    .mergeMap(action => newKernelObservable(action.kernelSpec, action.cwd))
    .catch((error, source) =>
      Observable.merge(
        Observable.of({
          type: ERROR_KERNEL_LAUNCH_FAILED,
          payload: error,
          error: true
        }),
        source
      )
    );
