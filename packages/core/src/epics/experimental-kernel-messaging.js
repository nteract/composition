// @flow

import {
  catchError,
  map,
  mergeMap,
  switchMap,
  concatMap,
  filter,
  bufferTime,
  tap
} from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";
import { empty } from "rxjs/observable/empty";

import { ActionsObservable, ofType } from "redux-observable";

import * as uuid from "uuid";

import * as selectors from "../selectors";
import * as actions from "../actions";
import * as actionTypes from "../actionTypes";
import type { AppState, KernelInfo } from "../state";

// These are all kernel epics that start taking a new way of handling how messages are sent and received

export const hookIntoKernel = (
  action$: ActionsObservable<*>,
  store: Store<AppState, *>
) => {
  return action$.pipe(
    ofType(actionTypes.LAUNCH_KERNEL_SUCCESSFUL),
    switchMap((action: actionTypes.NewKernelAction) => {
      const {
        payload: {
          kernel: { channels },
          kernelRef
        }
      } = action;

      return channels.pipe(
        bufferTime(200),
        filter((x: Array<any>) => x.length !== 0),
        map(messages =>
          actions.bufferedJupyterMessages({
            messages,
            kernelRef
          })
        )
      );
    })
  );
};
