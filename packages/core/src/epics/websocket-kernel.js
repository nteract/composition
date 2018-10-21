// @flow

import { ofType } from "redux-observable";
import type { ActionsObservable, StateObservable } from "redux-observable";
import {
  catchError,
  map,
  mergeMap,
  switchMap,
  concatMap,
  filter
} from "rxjs/operators";
import { of, empty } from "rxjs";
import { kernels, sessions } from "rx-jupyter";
import { kernelInfoRequest } from "@nteract/messaging";

import * as actions from "../actions";
import * as selectors from "../selectors";
import * as actionTypes from "../actionTypes";
import { castToSessionId } from "../state/ids";
import { createKernelRef } from "../state/refs";
import type { AppState } from "../state";
import type { RemoteKernelProps } from "../state/entities/kernels";

import { extractNewKernel } from "./kernel-lifecycle";

export const launchWebSocketKernelEpic = (
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_BY_NAME),
    // Only accept jupyter servers for the host with this epic
    filter(() => selectors.isCurrentHostJupyter(state$.value)),
    // TODO: When a switchMap happens, we need to close down the originating
    // kernel, likely by sending a different action. Right now this gets
    // coordinated in a different way.
    switchMap((action: actionTypes.LaunchKernelByNameAction) => {
      const state = state$.value;
      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

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
            sessionId: sessionId,
            cwd,
            channels: kernels.connect(
              serverConfig,
              session.kernel.id,
              sessionId
            ),
            kernelSpecName
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
        })
      );
    })
  );

export const changeWebSocketKernelEpic = (
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actionTypes.CHANGE_KERNEL_BY_NAME),
    // Only accept jupyter servers for the host with this epic
    filter(() => selectors.isCurrentHostJupyter(state$.value)),
    // TODO: When a switchMap happens, we need to close down the originating
    // kernel, likely by sending a different action. Right now this gets
    // coordinated in a different way.
    switchMap((action: actionTypes.ChangeKernelByName) => {
      const {
        payload: { contentRef, oldKernelRef, kernelSpecName }
      } = action;
      const state = state$.value;
      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

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
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actionTypes.INTERRUPT_KERNEL),
    // This epic can only interrupt kernels on jupyter websockets
    filter(() => selectors.isCurrentHostJupyter(state$.value)),
    // If the user fires off _more_ interrupts, we shouldn't interrupt the in-flight
    // interrupt, instead doing it after the last one happens
    concatMap((action: actionTypes.InterruptKernel) => {
      const state = state$.value;

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      const kernel = selectors.currentKernel(state);
      if (!kernel) {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Can't interrupt a kernel we don't have"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      if (kernel.type !== "websocket" || !kernel.id) {
        return of(
          actions.interruptKernelFailed({
            error: new Error("Invalid kernel type for interrupting"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      const id = kernel.id;

      return kernels.interrupt(serverConfig, id).pipe(
        map(() =>
          actions.interruptKernelSuccessful({
            kernelRef: action.payload.kernelRef
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

// NB: This epic kills the *current* kernel. ZMQ killKernelEpic kills a *specified* kernel.
export const killKernelEpic = (
  action$: ActionsObservable<redux$Action>,
  state$: StateObservable<AppState>
) =>
  // TODO: Use the sessions API for this
  action$.pipe(
    ofType(actionTypes.KILL_KERNEL),
    // This epic can only interrupt kernels on jupyter websockets
    filter(() => selectors.isCurrentHostJupyter(state$.value)),
    // If the user fires off _more_ kills, we shouldn't interrupt the in-flight
    // kill, instead doing it after the last one happens
    concatMap((action: actionTypes.KillKernelAction) => {
      const state = state$.value;

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      const kernel = selectors.currentKernel(state);
      if (!kernel) {
        return of(
          actions.killKernelFailed({
            error: new Error("kernel not available for killing"),
            kernelRef: action.payload.kernelRef
          })
        );
      }

      if (kernel.type !== "websocket" || !kernel.id || !kernel.sessionId) {
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
        map(() =>
          actions.killKernelSuccessful({
            kernelRef: action.payload.kernelRef
          })
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
