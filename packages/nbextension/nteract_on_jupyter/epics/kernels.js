/* @flow */

import { kernels } from "rx-jupyter";

import { of } from "rxjs/add/observable/of";
import { merge } from "rxjs/add/observable/merge";

import {
  tap,
  map,
  switchMap,
  mapTo,
  mergeMap,
  catchError
} from "rxjs/operators";

import type { ActionsObservable } from "redux-observable";

import type { START_KERNEL } from "../actions/kernels";

import type { ALL_ACTIONS } from "../actions/";

import { genericAjaxFail } from "../actions";

function startKernel(name: string, path: string): START_KERNEL {
  return { type: "START_KERNEL", name, path };
}

export function startKernelEpic(
  action$: ActionsObservable<ALL_ACTIONS>,
  store: Store<*, *>
) {
  return action$.ofType("START_KERNEL").pipe(
    switchMap((action: START_KERNEL) => {
      // TODO: Reflect on how the desktop app is doing this so that we
      // can share code for kernel lifecycle

      const config = store.getState().config;
      // TODO: Stop normalizing every time we do our call and make it part of
      // our state
      const serverConfig = {
        endpoint: config.baseUrl,
        crossDomain: false
      };

      // $FlowFixMe: WTF
      return kernels.start(serverConfig, action.name, action.path).pipe(
        tap(xhr => {
          console.log(xhr);
          if (xhr.status !== 200) {
            throw new Error(xhr.response);
          }
        }),
        map(xhr => {
          return {
            type: "LAUNCHED_KERNEL",
            payload: xhr.response
          };
        }),
        catchError((xhrError: any) => of(genericAjaxFail(xhrError)))
      );
    })
  );
}

export function autoconnectEpic(
  action$: ActionsObservable<ALL_ACTIONS>,
  store: Store<*, *>
) {
  return action$.ofType("LAUNCHED_KERNEL").pipe(
    switchMap((action: any) => {
      // TODO: Reflect on how the desktop app is doing this so that we
      // can share code for kernel lifecycle

      const config = store.getState().config;
      // TODO: Stop normalizing every time we do our call and make it part of
      // our state
      const serverConfig = {
        endpoint: config.baseUrl,
        crossDomain: false
      };

      // These aren't pure nteract channels, we'll adapt them though
      const channels = kernels.connect(serverConfig, action.id);
      return of({
        type: "LAUNCHED_KERNEL",
        channels,
        id: action.id
      });
    })
  );
}
