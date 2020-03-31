import * as actions from "@nteract/actions";
import { kernelInfoRequest } from "@nteract/messaging";
import * as selectors from "@nteract/selectors";
import { AppState, castToSessionId, createKernelRef, KernelRecord, RemoteKernelProps, ServerConfig } from "@nteract/types";
import { ofType, StateObservable } from "redux-observable";
import { kernels, sessions } from "rx-jupyter";
import { empty, Observable, of } from "rxjs";

import { AjaxResponse } from "rxjs/ajax";
import { catchError, concatMap, filter, map, mergeMap, switchMap } from "rxjs/operators";
import { extractNewKernel } from "./kernel-lifecycle";

export const launchWebSocketKernelEpic = (
  action$: Observable<actions.LaunchKernelByNameAction>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.LAUNCH_KERNEL_BY_NAME),
    // Only accept jupyter servers for the host with this epic
    filter(() => selectors.isCurrentHostJupyter(state$.value)),
    // TODO: When a switchMap happens, we need to close down the originating
    // kernel, likely by sending a different action. Right now this gets
    // coordinated in a different way.
    switchMap((action: actions.LaunchKernelByNameAction) => {
      const state = state$.value;
      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig: ServerConfig = selectors.serverConfig(host);
      const hostRef = selectors.hostRefByHostRecord(state, { host });

      const {
        payload: { kernelSpecName, cwd, kernelRef, contentRef }
      } = action;

      const content = selectors.content(state, { contentRef });
      if (!content || content.type !== "notebook") {
        return empty();
      }

      // TODO: Create a START_SESSION action instead (?)
      const sessionPayload = {
        kernel: {
          id: null,
          name: kernelSpecName
        },
        name: "",
        // TODO: Figure where the leading slash comes from in the content store
        path: content.filepath.replace(/^\/+/g, ""),
        type: "notebook"
      };

      // TODO: Handle failure cases here
      return sessions.create(serverConfig, sessionPayload).pipe(
        mergeMap(data => {
          const session = data.response;

          const sessionId = castToSessionId(session.id);

          const kernel: RemoteKernelProps = Object.assign({}, session.kernel, {
            type: "websocket",
            info: null,
            sessionId,
            cwd,
            channels: kernels.connect(
              serverConfig,
              session.kernel.id,
              sessionId
            ),
            kernelSpecName,
            hostRef,
            status: session.kernel.execution_state
          });

          kernel.channels.next(kernelInfoRequest());

          return of(
            actions.launchKernelSuccessful({
              kernel,
              kernelRef,
              contentRef: action.payload.contentRef,
              selectNextKernel: true
            })
          );
        }),
        catchError(error => {
          return of(actions.launchKernelFailed({ error }));
        })
      );
    })
  );

export const changeWebSocketKernelEpic = (
  action$: Observable<actions.ChangeKernelByName>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.CHANGE_KERNEL_BY_NAME),
    // Only accept jupyter servers for the host with this epic
    filter(() => selectors.isCurrentHostJupyter(state$.value)),
    // TODO: When a switchMap happens, we need to close down the originating
    // kernel, likely by sending a different action. Right now this gets
    // coordinated in a different way.
    switchMap((action: actions.ChangeKernelByName) => {
      const {
        payload: { contentRef, oldKernelRef, kernelSpecName }
      } = action;
      const state = state$.value;
      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig: ServerConfig = selectors.serverConfig(host);

      // TODO: This is the case where we didn't have a kernel before
      //       and they chose to switch kernels. Instead we need to allow
      //       "switching" by disregarding the previous kernel and creating a
      //       new session
      if (!oldKernelRef) {
        return empty();
      }

      const oldKernel = selectors.kernel(state, { kernelRef: oldKernelRef });
      if (!oldKernel || oldKernel.type !== "websocket") {
        return empty();
      }
      const { sessionId } = oldKernel;
      if (!sessionId) {
        return empty();
      }

      const content = selectors.content(state, { contentRef });
      if (!content || content.type !== "notebook") {
        return empty();
      }
      const {
        filepath,
        model: { notebook }
      } = content;
      const { cwd } = extractNewKernel(filepath, notebook);

      const kernelRef = createKernelRef();
      return kernels.start(serverConfig, kernelSpecName, cwd).pipe(
        mergeMap(({ response }) => {
          const { id: kernelId } = response;
          const sessionPayload = {
            kernel: { id: kernelId, name: kernelSpecName }
          };
          // The sessions API will close down the old kernel for us if it is
          // on this session
          return sessions.update(serverConfig, sessionId, sessionPayload).pipe(
            mergeMap(({ response: session }) => {
              const kernel: RemoteKernelProps = Object.assign(
                {},
                session.kernel,
                {
                  type: "websocket",
                  sessionId,
                  cwd,
                  channels: kernels.connect(
                    serverConfig,
                    session.kernel.id,
                    sessionId
                  ),
                  kernelSpecName
                }
              );
              return of(
                actions.launchKernelSuccessful({
                  kernel,
                  kernelRef,
                  contentRef: action.payload.contentRef,
                  selectNextKernel: true
                })
              );
            }),
            catchError(error =>
              of(actions.launchKernelFailed({ error, kernelRef, contentRef }))
            )
          );
        }),
        catchError(error =>
          of(actions.launchKernelFailed({ error, kernelRef, contentRef }))
        )
      );
    })
  );

export const interruptKernelEpic = (
  action$: Observable<actions.InterruptKernel>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.INTERRUPT_KERNEL),
    // This epic can only interrupt kernels on jupyter websockets
    filter(() => selectors.isCurrentHostJupyter(state$.value)),
    // If the user fires off _more_ interrupts, we shouldn't interrupt the in-flight
    // interrupt, instead doing it after the last one happens
    concatMap((action: actions.InterruptKernel) => {
      const state = state$.value;

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig: ServerConfig = selectors.serverConfig(host);

      const { contentRef } = action.payload;

      let kernel: KernelRecord | null | undefined;
      if (contentRef) {
        kernel = selectors.kernelByContentRef(state$.value, {
          contentRef
        });
      } else {
        kernel = selectors.currentKernel(state$.value);
      }

      if (!kernel) {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Can't interrupt a kernel we don't have"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      if (kernel.type !== "websocket") {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Invalid kernel type for interrupting"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      if (!kernel.id) {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Kernel does not have ID set"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      const id = kernel.id;

      return kernels.interrupt(serverConfig, id).pipe(
        map(() =>
          actions.interruptKernelSuccessful({
            kernelRef: action.payload.kernelRef,
            contentRef
          })
        ),
        catchError(err =>
          of(
            actions.interruptKernelFailed({
              error: err,
              kernelRef: action.payload.kernelRef
            })
          )
        )
      );
    })
  );

export const killKernelEpic = (
  action$: Observable<actions.KillKernelAction>,
  state$: StateObservable<AppState>
) =>
  // TODO: Use the sessions API for this
  action$.pipe(
    ofType(actions.KILL_KERNEL),
    // This epic can only interrupt kernels on jupyter websockets
    filter(() => selectors.isCurrentHostJupyter(state$.value)),
    // If the user fires off _more_ kills, we shouldn't interrupt the in-flight
    // kill, instead doing it after the last one happens
    concatMap((action: actions.KillKernelAction) => {
      const state = state$.value;

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig: ServerConfig = selectors.serverConfig(host);

      const { contentRef, kernelRef } = action.payload;

      let kernel: KernelRecord | null | undefined;
      if (contentRef) {
        kernel = selectors.kernelByContentRef(state, { contentRef });
      } else if (kernelRef) {
        kernel = selectors.kernel(state, { kernelRef });
      } else {
        kernel = selectors.currentKernel(state);
      }

      if (!kernel) {
        return of(
          actions.killKernelFailed({
            error: new Error("kernel not available for killing"),
            kernelRef
          })
        );
      }

      if (kernel.type !== "websocket") {
        return of(
          actions.killKernelFailed({
            error: new Error(
              "websocket kernel epic can only kill websocket kernels with an id"
            ),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      if (!kernel.id || !kernel.sessionId) {
        return of(
          actions.killKernelFailed({
            error: new Error(
              "websocket kernel epic can only kill websocket kernels with an id"
            ),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      // TODO: If this was a kernel language change, we shouldn't be using this
      //       kill kernel epic because we need to make sure that creation happens
      //       after deletion
      return sessions.destroy(serverConfig, kernel.sessionId).pipe(
        mergeMap(() =>
          action.payload.dispose && action.payload.kernelRef
            ? of(
                actions.killKernelSuccessful({
                  kernelRef: action.payload.kernelRef
                }),
                actions.disposeKernel({ kernelRef: action.payload.kernelRef })
              )
            : of(
                actions.killKernelSuccessful({
                  kernelRef: action.payload.kernelRef
                })
              )
        ),
        catchError(err =>
          of(
            actions.killKernelFailed({
              error: err,
              kernelRef: action.payload.kernelRef
            })
          )
        )
      );
    })
  );

export const restartWebSocketKernelEpic = (
  action$: Observable<actions.RestartKernel>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.RESTART_KERNEL),
    concatMap((action: actions.RestartKernel) => {
      const state = state$.value;

      const { contentRef, outputHandling } = action.payload;
      const kernelRef =
        selectors.kernelRefByContentRef(state, { contentRef }) ||
        action.payload.kernelRef;

      /**
       * If there is still no KernelRef, then throw an error.
       */
      if (!kernelRef) {
        return of(
          actions.restartKernelFailed({
            error: new Error("Can't execute restart without kernel ref."),
            kernelRef: "none provided",
            contentRef
          })
        );
      }

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        return of(
          actions.restartKernelFailed({
            error: new Error("Can't restart a kernel with no Jupyter host."),
            kernelRef,
            contentRef
          })
        );
      }

      const serverConfig: ServerConfig = selectors.serverConfig(host);

      const kernel = selectors.kernel(state, { kernelRef });
      if (!kernel) {
        return of(
          actions.restartKernelFailed({
            error: new Error("Can't restart a kernel that does not exist."),
            kernelRef,
            contentRef
          })
        );
      }

      if (kernel.type !== "websocket" || !kernel.id) {
        return of(
          actions.restartKernelFailed({
            error: new Error("Can only restart Websocket kernels via API."),
            kernelRef,
            contentRef
          })
        );
      }

      const id = kernel.id;

      return kernels.restart(serverConfig, id).pipe(
        mergeMap((response: AjaxResponse) => {
          if (response.status !== 200) {
            return of(
              actions.restartKernelFailed({
                error: new Error("Unsuccessful kernel restart."),
                kernelRef,
                contentRef
              })
            );
          } else {
            if (outputHandling === "Run All") {
              return of(
                actions.restartKernelSuccessful({
                  kernelRef,
                  contentRef
                }),
                actions.executeAllCells({ contentRef })
              );
            } else if (outputHandling === "Clear All") {
              return of(
                actions.restartKernelSuccessful({
                  kernelRef,
                  contentRef
                }),
                actions.clearAllOutputs({ contentRef })
              );
            } else {
              return of(
                actions.restartKernelSuccessful({
                  kernelRef,
                  contentRef
                })
              );
            }
          }
        }),
        catchError(error =>
          of(actions.restartKernelFailed({ error, kernelRef, contentRef }))
        )
      );
    })
  );
