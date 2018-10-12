/* @flow */

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { from } from "rxjs/observable/from";
import { createKernelRef } from "../state/refs";

import { createMessage, childOf, ofMessageType } from "@nteract/messaging";

import type { Notebook, ImmutableNotebook } from "@nteract/commutable";
import type { ContentRef, KernelRef } from "../state/refs";

const path = require("path");

import {
  filter,
  map,
  tap,
  mergeMap,
  concatMap,
  catchError,
  first,
  pluck,
  switchMap,
  take,
  timeout
} from "rxjs/operators";

import { ActionsObservable, ofType } from "redux-observable";

import * as selectors from "../selectors";
import * as actions from "../actions";
import * as actionTypes from "../actionTypes";
import type { AppState, KernelInfo } from "../state";

/**
 * Sets the execution state after a kernel has been launched.
 *
 * @oaram  {ActionObservable}  action$ ActionObservable for LAUNCH_KERNEL_SUCCESSFUL action
 */
export const watchExecutionStateEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: actionTypes.NewKernelAction) =>
      action.payload.kernel.channels.pipe(
        filter(msg => msg.header.msg_type === "status"),
        map(msg =>
          actions.setExecutionState({
            kernelStatus: msg.content.execution_state,
            kernelRef: action.payload.kernelRef,
            contentRef: action.payload.contentRef
          })
        )
      )
    )
  );

/**
 * Send a kernel_info_request to the kernel.
 *
 * @param  {Object}  channels  A object containing the kernel channels
 * @returns  {Observable}  The reply from the server
 */
export function acquireKernelInfo(
  channels: Channels,
  kernelRef: KernelRef,
  contentRef: ContentRef
) {
  const message = createMessage("kernel_info_request");

  const obs = channels.pipe(
    childOf(message),
    ofMessageType("kernel_info_reply"),
    first(),
    mergeMap(msg => {
      const c = msg.content;
      const l = c.language_info;

      const info: KernelInfo = {
        protocolVersion: c.protocol_version,
        implementation: c.implementation,
        implementationVersion: c.implementation_version,
        banner: c.banner,
        helpLinks: c.help_links,
        languageName: l.name,
        languageVersion: l.version,
        mimetype: l.mimetype,
        fileExtension: l.file_extension,
        pygmentsLexer: l.pygments_lexer,
        codemirrorMode: l.codemirror_mode,
        nbconvertExporter: l.nbconvert_exporter
      };

      return of(
        // The original action we were using
        actions.setLanguageInfo({
          langInfo: msg.content.language_info,
          kernelRef,
          contentRef
        }),
        actions.setKernelInfo({
          kernelRef,
          info
        })
      );
    })
  );

  return Observable.create(observer => {
    const subscription = obs.subscribe(observer);
    channels.next(message);
    return subscription;
  });
}

/**
 * Gets information about newly launched kernel.
 *
 * @param  {ActionObservable}  The action type
 */
export const acquireKernelInfoEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: actionTypes.NewKernelAction) => {
      const {
        payload: {
          kernel: { channels },
          kernelRef,
          contentRef
        }
      } = action;
      return acquireKernelInfo(channels, kernelRef, contentRef);
    })
  );

export const extractNewKernel = (
  filepath: ?string,
  notebook: ImmutableNotebook
) => {
  const cwd = (filepath && path.dirname(filepath)) || "/";

  const kernelSpecName = notebook.getIn(
    ["metadata", "kernelspec", "name"],
    notebook.getIn(["metadata", "language_info", "name"], "python3")
  );

  return {
    cwd,
    kernelSpecName
  };
};

/**
 * NOTE: This function is _highly similar_ to the desktop loading.js version
 *       with two exceptions -- extractNewKernel and kernelType
 *       Can they be combined without incurring a penalty on the web app?
 *       extractNewKernel - The native functions used are `path.dirname`, `path.resolve`, and `process.cwd()`
 *                          We could always inject those dependencies separately...
 *       kernelType - See #3427, this relates to the currently-unrepresentable state of "launching a kernel
 *                    but we aren't sure if it's local or remote yet".
 */
export const launchKernelWhenNotebookSetEpic = (
  action$: ActionsObservable<*>,
  store: *
) =>
  action$.pipe(
    ofType(actionTypes.FETCH_CONTENT_FULFILLED),
    mergeMap((action: actionTypes.FetchContentFulfilled) => {
      const state: AppState = store.getState();

      const contentRef = action.payload.contentRef;

      const content = selectors.content(state, { contentRef });

      if (
        !content ||
        content.type !== "notebook" ||
        content.model.type !== "notebook"
      ) {
        // This epic only handles notebook content
        return empty();
      }

      const filepath = content.filepath;
      const notebook = content.model.notebook;

      const { cwd, kernelSpecName } = extractNewKernel(filepath, notebook);

      return of(
        actions.launchKernelByName({
          kernelSpecName,
          kernelType: "websocket",
          cwd,
          kernelRef: action.payload.kernelRef,
          selectNextKernel: true,
          contentRef: action.payload.contentRef
        })
      );
    })
  );

export const restartKernelEpic = (
  action$: ActionsObservable<*>,
  store: *,
  kernelRefGenerator: () => KernelRef = createKernelRef
) =>
  action$.pipe(
    ofType(actionTypes.RESTART_KERNEL),
    concatMap((action: actionTypes.RestartKernel) => {
      const state = store.getState();

      const oldKernelRef = action.payload.kernelRef;
      const oldKernel = selectors.kernel(state, { kernelRef: oldKernelRef });

      const notificationSystem = selectors.notificationSystem(state);

      if (!oldKernelRef || !oldKernel) {
        notificationSystem.addNotification({
          title: "Failure to Restart",
          message: `Unable to restart kernel, please select a new kernel.`,
          dismissible: true,
          position: "tr",
          level: "error"
        });

        // TODO: Wow do we need to send notifications through our store for
        // consistency
        return empty();
      }

      const newKernelRef = kernelRefGenerator();
      const initiatingContentRef = action.payload.contentRef;

      // TODO: Incorporate this into each of the launchKernelByName
      //       actions...
      //       This only mirrors the old behavior of restart kernel (for now)
      notificationSystem.addNotification({
        title: "Kernel Restarting...",
        message: `Kernel ${oldKernel.kernelSpecName ||
          "unknown"} is restarting.`,
        dismissible: true,
        position: "tr",
        level: "success"
      });

      const kill = actions.killKernel({
        restarting: true,
        kernelRef: oldKernelRef
      });

      const relaunch = actions.launchKernelByName({
        kernelSpecName: oldKernel.kernelSpecName,
        kernelType: oldKernel.type,
        cwd: oldKernel.cwd,
        kernelRef: newKernelRef,
        selectNextKernel: true,
        contentRef: initiatingContentRef
      });

      const awaitKernelReady = action$.pipe(
        ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
        filter(
          (action: actionTypes.NewKernelAction) =>
            action.payload.kernelRef === newKernelRef
        ),
        take(1),
        timeout(60000), // If kernel doesn't come up within this interval we will abort follow-on actions.
        concatMap(_ => {
          const restartSuccess = actions.restartKernelSuccessful({
            kernelRef: newKernelRef,
            contentRef: initiatingContentRef
          });

          if (action.payload.outputHandling === "Run All") {
            return of(
              restartSuccess,
              actions.executeAllCells({ contentRef: initiatingContentRef })
            );
          } else {
            return of(restartSuccess);
          }
        }),
        catchError(error => {
          return of(
            actions.restartKernelFailed({
              error: error,
              kernelRef: newKernelRef,
              contentRef: initiatingContentRef
            })
          );
        })
      );

      return merge(of(kill, relaunch), awaitKernelReady);
    })
  );
