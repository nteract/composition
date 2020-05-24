/**
 * This file contains epics associated with the lazy launch of kernels.
 *
 * Typically, the kernel associated with the Jupyter notebook is launched
 * when the user opens the notebook. With lazy launch, the launch of the
 * kernel is delayed until the user requests executes a cell.
 *
 * This feature helps reduce the cost associated with running extraneous
 * kernels on compute resources and enables "view-only" model for notebook
 * apps.
 */
import { AnyAction } from "redux";
import { StateObservable, ofType } from "redux-observable";
import { of, merge, Observable } from "rxjs";
import { switchMap, filter, distinct, withLatestFrom } from "rxjs/operators";

import * as actions from "@nteract/actions";
import * as selectors from "@nteract/selectors";
import { AppState, KernelStatus, errors } from "@nteract/types";

import { extractNewKernel } from "../kernel-lifecycle";

/**
 * Executes all requests in the message queue then clears the queue after
 * the kernel is launched successfully and is ready to execute.
 */
export const executeCellAfterKernelLaunchEpic = (
  action$: Observable<actions.NewKernelAction>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    ofType(actions.LAUNCH_KERNEL_SUCCESSFUL),
    withLatestFrom(state$),
    filter(([action, state]) => {
      if (selectors.messageQueue(state).size === 0) {
        return false;
      }

      const contentRef = action.payload.contentRef;
      const kernel = selectors.kernelByContentRef(state, { contentRef });
      return !!(
        kernel &&
        kernel.channels &&
        kernel.status !== KernelStatus.NotConnected &&
        kernel.status !== KernelStatus.ShuttingDown
      );
    }),
    switchMap(([_action, state]) =>
      merge(
        of(
          ...selectors
            .messageQueue(state)
            .map((queuedAction: AnyAction) =>
              actions.executeCell(queuedAction.payload)
            )
        ),
        of(actions.clearMessageQueue())
      )
    )
  );

/**
 * Launches the kernel when user tries to execute a cell.
 * The distinct operator prevents the LaunchKernelByName action from
 * being emitted more than once within the same notebook.
 */
export function lazyLaunchKernelEpic(
  action$: Observable<actions.ExecuteCell>,
  state$: StateObservable<AppState>
) {
  return action$.pipe(
    ofType(actions.EXECUTE_CELL),
    filter((action: actions.ExecuteCell) => {
      const state = state$.value;
      const contentRef = action.payload.contentRef;
      return !selectors.kernelByContentRef(state, { contentRef });
    }),
    switchMap(action => {
      const state = state$.value;
      const contentRef = action.payload.contentRef;
      if (!contentRef) {
        return of(
          actions.launchKernelFailed({
            error: new Error("Launch kernel did not receive a ContentRef."),
            code: errors.LAUNCH_NO_CONTENT_REF,
            contentRef
          })
        );
      }
      const content = selectors.content(state, { contentRef });
      const kernelRef = selectors.kernelRefByContentRef(state, {
        contentRef
      });

      if (
        !kernelRef ||
        !content ||
        content.type !== "notebook" ||
        content.model.type !== "notebook"
      ) {
        return of(
          actions.launchKernelFailed({
            error: new Error(
              "Launch kernel failed because the source content is not a notebook"
            ),
            code: errors.LAUNCH_NOT_A_NOTEBOOK
          })
        );
      }

      const filepath = content.filepath;
      const notebook = content.model.notebook;
      const { cwd, kernelSpecName } = extractNewKernel(filepath, notebook);

      return of(
        actions.launchKernelByName({
          kernelSpecName,
          cwd,
          kernelRef,
          selectNextKernel: true,
          contentRef
        })
      );
    }),
    distinct(
      (
        action:
          | actions.LaunchKernelByNameAction
          | actions.LaunchKernelFailed
          | actions.ExecuteCell
      ) => action.payload.contentRef
    )
  );
}
