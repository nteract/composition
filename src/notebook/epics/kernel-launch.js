import Rx from 'rxjs/Rx';

import { launch } from 'spawnteract';

import * as uuid from 'uuid';

import {
  ipcRenderer as ipc,
} from 'electron';

import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';

import {
  createMessage,
} from '../kernel/messaging';

import {
  setExecutionState,
  setNotebookKernelInfo,
} from '../actions';

import {
  NEW_KERNEL,
  LAUNCH_KERNEL,
  SET_LANGUAGE_INFO,
  ERROR_KERNEL_LAUNCH_FAILED,
} from '../constants';

export function setLanguageInfo(langInfo) {
  return {
    type: SET_LANGUAGE_INFO,
    langInfo,
  };
}

/**
  * Send a kernel_info_request to the kernel.
  *
  * @param  {Object}  channels  A object containing the kernel channels
  * @returns  {Observable}  The reply from the server
  */
export function acquireKernelInfo(channels) {
  const message = createMessage('kernel_info_request');

  const obs = channels.shell
    .childOf(message)
    .ofMessageType(['kernel_info_reply'])
    .first()
    .pluck('content', 'language_info')
    .map(setLanguageInfo);

  return Rx.Observable.create(observer => {
    const subscription = obs.subscribe(observer);
    channels.shell.next(message);
    return subscription;
  });
}

/**
  * Instantiate a connection to a new kernel.
  *
  * @param  {String}  kernelSpecName  The name of the kernel to launch
  * @param  {String}  cwd The working directory to launch the kernel in
  */
export function newKernelObservable(kernelSpecName, cwd) {
  return Rx.Observable.create((observer) => {
    launch(kernelSpecName, { cwd })
      .then(c => {
        const { config, spawn, connectionFile, kernelSpec } = c;

        const identity = uuid.v4();
        // TODO: I'm realizing that we could trigger on when the underlying sockets
        //       are ready with these subjects to let us know when the kernels
        //       are *really* ready
        const channels = {
          shell: createShellSubject(identity, config),
          iopub: createIOPubSubject(identity, config),
          control: createControlSubject(identity, config),
          stdin: createStdinSubject(identity, config),
        };
        observer.next(setNotebookKernelInfo({
          name: kernelSpecName,
          spec: kernelSpec,
        }));

        observer.next({
          type: NEW_KERNEL,
          channels,
          connectionFile,
          spawn,
          kernelSpecName,
          kernelSpec,
        });
        observer.complete();
      });
  });
}

/**
  * Sets the execution state after a kernel has been launched.
  *
  * @oaram  {ActionObservable}  action$ ActionObservable for NEW_KERNEL action
  */
export const watchExecutionStateEpic = action$ =>
  action$.ofType(NEW_KERNEL)
    .switchMap(action =>
      Rx.Observable.merge(
        action.channels.iopub
          .filter(msg => msg.header.msg_type === 'status')
          .map(msg => setExecutionState(msg.content.execution_state)),
        Rx.Observable.of(setExecutionState('idle'))
      )
    );

/**
  * Gets information about newly launched kernel.
  *
  * @param  {ActionObservable}  The action type
  */
export const acquireKernelInfoEpic = action$ =>
  action$.ofType(NEW_KERNEL)
    .switchMap(action => {
      /* istanbul ignore if -- used for interactive debugging */
      if (process.env.DEBUG) {
        window.channels = action.channels;
      }
      return acquireKernelInfo(action.channels);
    });

/**
  * Launches a new kernel.
  *
  * @param  {ActionObservable} action$  ActionObservable for LAUNCH_KERNEL action
  */
export const newKernelEpic = action$ =>
  action$.ofType(LAUNCH_KERNEL)
    .do(action => {
      if (!action.kernelSpecName) {
        throw new Error('newKernel needs a kernelSpecName');
      }
      ipc.send('nteract:ping:kernel', action.kernelSpecName);
    })
    .mergeMap(action =>
      newKernelObservable(action.kernelSpecName, action.cwd)
    )
    .catch(error => Rx.Observable.of({
      type: ERROR_KERNEL_LAUNCH_FAILED,
      payload: error,
      error: true,
    }));
