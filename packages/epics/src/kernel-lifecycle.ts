import { ImmutableNotebook } from "@nteract/commutable";
import {
  Channels,
  childOf,
  createMessage,
  JupyterMessage,
  ofMessageType
} from "@nteract/messaging";
import { ActionsObservable, ofType } from "redux-observable";
import { empty, merge, Observable, Observer, of } from "rxjs";
import {
  catchError,
  concatMap,
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  take,
  takeUntil,
  timeout
} from "rxjs/operators";

import * as actions from "@nteract/actions";
import * as selectors from "@nteract/selectors";
import { ContentRef, KernelRef } from "@nteract/types";
import { createKernelRef } from "@nteract/types";
import { AppState, KernelInfo } from "@nteract/types";

const path = require("path");

/**
 * Sets the execution state after a kernel has been launched.
 *
 * @oaram  {ActionObservable}  action$ ActionObservable for LAUNCH_KERNEL_SUCCESSFUL action
 */
export const watchExecutionStateEpic = (
  action$: ActionsObservable<actions.NewKernelAction>
) =>
  action$.pipe(
    ofType(actions.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: actions.NewKernelAction) =>
      action.payload.kernel.channels.pipe(
        filter((msg: JupyterMessage) => msg.header.msg_type === "status"),
        map((msg: JupyterMessage) =>
          actions.setExecutionState({
            kernelStatus: msg.content.execution_state,
            kernelRef: action.payload.kernelRef
          })
        ),
        takeUntil(action$.pipe(ofType(actions.KILL_KERNEL_SUCCESSFUL)))
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

      let result;
      if (!c.protocol_version.startsWith("5")) {
        result = [
          actions.launchKernelFailed({
            kernelRef,
            contentRef,
            error: new Error(
              "The kernel that you are attempting to launch does not support the latest version (v5) of the messaging protocol."
            )
          })
        ];
      } else {
        result = [
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
        ];
      }

      return of(...result);
    })
  );

  return Observable.create((observer: Observer<any>) => {
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
export const acquireKernelInfoEpic = (
  action$: ActionsObservable<actions.NewKernelAction>
) =>
  action$.pipe(
    ofType(actions.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: actions.NewKernelAction) => {
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
  filepath: string | null,
  notebook: ImmutableNotebook
) => {
  const cwd = (filepath && path.dirname(filepath)) || "/";

  const kernelSpecName =
    notebook.getIn(["metadata", "kernelspec", "name"]) ||
    notebook.getIn(["metadata", "language_info", "name"]) ||
    "python3";

  return {
    cwd,
    kernelSpecName
  };
};

/**
 * NOTE: This function is _exactly_ the same as the desktop loading.js version
 *       with one strong exception -- extractNewKernel
 *       Can they be combined without incurring a penalty on the web app?
 *       The native functions used are `path.dirname`, `path.resolve`, and `process.cwd()`
 *       We could always inject those dependencies separately...
 */
export const launchKernelWhenNotebookSetEpic = (
  action$: ActionsObservable<actions.FetchContentFulfilled>,
  state$: any
) =>
  action$.pipe(
    ofType(actions.FETCH_CONTENT_FULFILLED),
    mergeMap((action: actions.FetchContentFulfilled) => {
      const state: AppState = state$.value;

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
          cwd,
          kernelRef: action.payload.kernelRef,
          selectNextKernel: true,
          contentRef: action.payload.contentRef
        })
      );
    })
  );

export const restartKernelEpic = (
  action$: ActionsObservable<actions.RestartKernel | actions.NewKernelAction>,
  state$: any,
  kernelRefGenerator: () => KernelRef = createKernelRef
) =>
  action$.pipe(
    ofType(actions.RESTART_KERNEL),
    concatMap((action: actions.RestartKernel | actions.NewKernelAction) => {
      const state = state$.value;
      const oldKernelRef = action.payload.kernelRef;
      const notificationSystem = selectors.notificationSystem(state);

      if (!oldKernelRef) {
        notificationSystem.addNotification({
          title: "Failure to Restart",
          message: "Unable to restart kernel, please select a new kernel.",
          dismissible: true,
          position: "tr",
          level: "error"
        });
        return empty();
      }

      const oldKernel = selectors.kernel(state, { kernelRef: oldKernelRef });

      if (!oldKernelRef || !oldKernel) {
        notificationSystem.addNotification({
          title: "Failure to Restart",
          message: "Unable to restart kernel, please select a new kernel.",
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
        cwd: oldKernel.cwd,
        kernelRef: newKernelRef,
        selectNextKernel: true,
        contentRef: initiatingContentRef
      });

      const awaitKernelReady = action$.pipe(
        ofType(actions.LAUNCH_KERNEL_SUCCESSFUL),
        filter(
          (action: actions.NewKernelAction | actions.RestartKernel) =>
            action.payload.kernelRef === newKernelRef
        ),
        take(1),
        timeout(60000), // If kernel doesn't come up within this interval we will abort follow-on actions.
        concatMap(() => {
          const restartSuccess = actions.restartKernelSuccessful({
            kernelRef: newKernelRef,
            contentRef: initiatingContentRef
          });

          if (
            (action as actions.RestartKernel).payload.outputHandling ===
            "Run All"
          ) {
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
              error,
              kernelRef: newKernelRef,
              contentRef: initiatingContentRef
            })
          );
        })
      );

      const actionsDispatched =
        oldKernel.type !== "websocket" ? of(kill, relaunch) : of(relaunch);

      return merge(actionsDispatched, awaitKernelReady);
    })
  );
