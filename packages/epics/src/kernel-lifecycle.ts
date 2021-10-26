import { ImmutableNotebook } from "@nteract/commutable";
import {
  Channels,
  childOf,
  createMessage,
  JupyterMessage,
  ofMessageType
} from "@nteract/messaging";
import { sendNotification } from "@nteract/mythic-notifications";
import { AnyAction } from "redux";
import { ofType, StateObservable } from "redux-observable";
import { EMPTY, merge, Observable, Observer, of } from "rxjs";
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
import { AppState, ContentRef, KernelInfo, KernelRef, KernelStatus } from "@nteract/types";
import { createKernelRef, errors } from "@nteract/types";

const path = require("path");

/**
 * Sets the execution state after a kernel has been launched.
 *
 * @oaram  {ActionObservable}  action$ ActionObservable for LAUNCH_KERNEL_SUCCESSFUL action
 */
export const watchExecutionStateEpic = (
  action$: Observable<
    actions.NewKernelAction | actions.KillKernelSuccessful
  >
) =>
  action$.pipe(
    ofType(actions.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap(
      (action: actions.NewKernelAction | actions.KillKernelSuccessful) =>
        (action as actions.NewKernelAction).payload.kernel.channels.pipe(
          filter((msg: JupyterMessage) => msg.header.msg_type === "status"),
          map((msg: JupyterMessage) =>
            actions.setExecutionState({
              kernelStatus: msg.content.execution_state,
              kernelRef: (action as actions.NewKernelAction).payload.kernelRef
            })
          ),
          takeUntil(
            action$.pipe(
              ofType(actions.KILL_KERNEL_SUCCESSFUL),
              filter(
                (
                  killAction:
                    | actions.KillKernelSuccessful
                    | actions.NewKernelAction
                ) => killAction.payload.kernelRef === action.payload.kernelRef
              )
            )
          ),
          catchError((error: Error) => {
            return of(
              actions.executeFailed({
                error: new Error(
                  "The WebSocket connection has unexpectedly disconnected."
                ),
                code: errors.EXEC_WEBSOCKET_ERROR,
                contentRef: (action as actions.NewKernelAction).payload.contentRef
              })
            );
          })
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
  contentRef: ContentRef,
  state: AppState,
  kernelSpecName?: string | null
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

      let result: AnyAction[];
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
          actions.setKernelInfo({
            kernelRef,
            contentRef,
            info
          }),
          actions.setExecutionState({ kernelStatus: KernelStatus.Launched, kernelRef })
        ];

        if (kernelSpecName) {
          const kernelspec = selectors.kernelspecByName(state, {
            name: kernelSpecName
          });
          if (kernelspec) {
            result.push(
              actions.setKernelMetadata({
                contentRef,
                kernelInfo: kernelspec
              })
            );
          }
        }
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
  action$: Observable<actions.NewKernelAction>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: actions.NewKernelAction) => {
      const {
        payload: {
          kernel: { channels, kernelSpecName },
          kernelRef,
          contentRef
        }
      } = action;
      return acquireKernelInfo(
        channels,
        kernelRef,
        contentRef,
        state$.value,
        kernelSpecName
      );
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
  action$: Observable<actions.FetchContentFulfilled>,
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
        return EMPTY;
      }

      /**
       * Avoid relaunching kernels for notebooks that have already
       * launched their content.
       */
      if (content.model.kernelRef) {
        const kernel = selectors.kernel(state, {
          kernelRef: content.model.kernelRef
        });
        if (kernel && kernel.channels) {
          return EMPTY;
        }
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

/**
 * Restarts a Jupyter kernel in the local scenario, where a restart requires
 * killing the existing kernel process and starting an ew one.
 */
export const restartKernelEpic = (
  action$: Observable<actions.RestartKernel | actions.NewKernelAction>,
  state$: any
) =>
  action$.pipe(
    ofType(actions.RESTART_KERNEL),
    concatMap((action: actions.RestartKernel | actions.NewKernelAction) => {
      const state = state$.value;

      const oldKernelRef = selectors.kernelRefByContentRef(state$.value, {
        contentRef: action.payload.contentRef
      });

      if (!oldKernelRef) {
        return of(
          sendNotification.create({
            title: "Failure to Restart",
            message: "Unable to restart kernel, please select a new kernel.",
            level: "error"
          })
        );
      }

      const oldKernel = selectors.kernel(state, { kernelRef: oldKernelRef });

      if (oldKernel && oldKernel.type === "websocket") {
        return EMPTY;
      }

      if (!oldKernelRef || !oldKernel) {
        return of(
          sendNotification.create({
            title: "Failure to Restart",
            message: "Unable to restart kernel, please select a new kernel.",
            level: "error"
          })
        );
      }

      const newKernelRef = createKernelRef();
      const initiatingContentRef = action.payload.contentRef;
      const successNotification = sendNotification.create({
        title: "Kernel Restarting...",
        message: `Kernel ${oldKernel.kernelSpecName ||
          "unknown"} is restarting.`,
        level: "success"
      });

      const kill = actions.killKernel({
        restarting: true,
        kernelRef: oldKernelRef
      });

      const relaunch = actions.launchKernelByName({
        kernelSpecName: oldKernel.kernelSpecName ?? undefined,
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

      return merge(of(kill, relaunch, successNotification), awaitKernelReady);
    })
  );
