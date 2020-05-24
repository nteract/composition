/**
 * This file contains epics associated with processing
 * particular types of messages returned from and sent to
 * the Jupyter kernel.
 */

import { StateObservable, ofType } from "redux-observable";
import { EMPTY, Observable, of } from "rxjs";
import { switchMap, filter, map, takeUntil, catchError } from "rxjs/operators";

import * as actions from "@nteract/actions";
import { inputReply, ofMessageType, JupyterMessage } from "@nteract/messaging";
import * as selectors from "@nteract/selectors";
import { AppState } from "@nteract/types";

/**
 * Process update_display_data messages that are sent from a Jupyter
 * kernel. This logic is placed in its own epic, as opposed to the core
 * execution epics because the kernel can send update_display_data messages
 * at any time.
 *
 * @param action$   The stream of actions being dispatched on the Redux store
 */
export const updateDisplayEpic = (
  action$: Observable<
    actions.NewKernelAction | actions.KillKernelSuccessful
  >
) =>
  // Global message watcher so we need to set up a feed for each new kernel
  action$.pipe(
    ofType(actions.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap(
      (action: actions.NewKernelAction | actions.KillKernelSuccessful) =>
        (action as actions.NewKernelAction).payload.kernel.channels.pipe(
          ofMessageType("update_display_data"),
          map((msg: JupyterMessage) =>
            actions.updateDisplay({
              content: msg.content,
              contentRef: (action as actions.NewKernelAction).payload.contentRef
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
          catchError((error: Error) =>
            of(
              actions.updateDisplayFailed({
                error,
                contentRef: (action as actions.NewKernelAction).payload
                  .contentRef
              })
            )
          )
        )
    )
  );

/**
 * Send responsese to stdin_requests to the kernel. This epic will
 * typically be triggered when the user executes an `input()` function
 * (in Python) then provides a response on the resulting form.
 *
 * @param action$   The stream of actions dispatched to the Redux store
 * @param state$    The stream of changes to the Redux store
 */
export const sendInputReplyEpic = (
  action$: Observable<actions.SendInputReply>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.SEND_INPUT_REPLY),
    switchMap((action: actions.SendInputReply) => {
      const state = state$.value;
      const kernel = selectors.kernelByContentRef(state, {
        contentRef: action.payload.contentRef
      });

      if (kernel) {
        const reply = inputReply({ value: action.payload.value });
        kernel.channels.next(reply);
      }

      return EMPTY;
    })
  );
