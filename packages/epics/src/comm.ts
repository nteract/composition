import { commMessageAction, commOpenAction, KILL_KERNEL_SUCCESSFUL, KillKernelSuccessful, LAUNCH_KERNEL_SUCCESSFUL, NewKernelAction } from "@nteract/actions";
import { ofMessageType } from "@nteract/messaging";
import * as selectors from "@nteract/selectors";
import { AppState } from "@nteract/types";
import { ofType, StateObservable } from "redux-observable";
import { merge, Observable } from "rxjs";
import { filter, map, switchMap, takeUntil } from "rxjs/operators";

import { ipywidgetsModel$ } from "./ipywidgets";

/**
 * An epic that emits comm actions from the backend kernel
 * @param  {Observable} action$ Action Observable from redux-observable
 * @param  {redux.Store} store   the redux store
 * @return {Observable}         Comm actions
 */
export const commListenEpic = (
  action$: Observable<NewKernelAction | KillKernelSuccessful>,
  state$: StateObservable<AppState>
) =>
  action$.pipe(
    // A LAUNCH_KERNEL_SUCCESSFUL action indicates we have a new channel
    ofType(LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: NewKernelAction | KillKernelSuccessful) => {
      const {
        payload: { kernel, contentRef }
      } = action as NewKernelAction;

      /**
       * We need the model of the currently loaded notebook so we can
       * determine what notebook to render the output of the widget onto.
       */
      const model = selectors.model(state$.value, { contentRef });

      const kernelRef = selectors.kernelRefByContentRef(state$.value, {
        contentRef
      });

      // Listen on the comms channel until KILL_KERNEL_SUCCESSFUL is emitted
      const commOpenAction$ = kernel.channels.pipe(
        ofMessageType("comm_open"),
        map(commOpenAction),
        takeUntil(
          action$.pipe(
            ofType(KILL_KERNEL_SUCCESSFUL),
            filter(
              (action: KillKernelSuccessful | NewKernelAction) =>
                action.payload.kernelRef === kernelRef
            )
          )
        )
      );

      const commMessageAction$ = kernel.channels.pipe(
        ofMessageType("comm_msg"),
        map(commMessageAction),
        takeUntil(
          action$.pipe(
            ofType(KILL_KERNEL_SUCCESSFUL),
            filter(
              (action: KillKernelSuccessful | NewKernelAction) =>
                action.payload.kernelRef === kernelRef
            )
          )
        )
      );

      return merge(
        ipywidgetsModel$(kernel, model, contentRef),
        commOpenAction$,
        commMessageAction$
      );
    })
  );
