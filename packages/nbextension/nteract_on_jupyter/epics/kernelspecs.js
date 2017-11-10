/* @flow */

import { kernelspecs } from "rx-jupyter";

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

import type { ALL_ACTIONS, GENERIC_AJAX_FAIL } from "../actions/";

import type { LIST_KERNELSPECS } from "../actions/kernelspecs";

import { genericAjaxFail } from "../actions";

function listKernelSpecs(): LIST_KERNELSPECS {
  return { type: "LIST_KERNELSPECS" };
}

type ServerConfig = {
  endpoint: string,
  crossDomain?: boolean
};

export function listKernelSpecsEpic(
  action$: ActionsObservable<ALL_ACTIONS>,
  store: Store<*, *>
) {
  return action$.ofType("LIST_KERNELSPECS").pipe(
    switchMap((action: LIST_KERNELSPECS) => {
      const config = store.getState().config;
      // Normalizing to match rx-jupyter vs. the jupyter server config
      const serverConfig = {
        endpoint: config.baseUrl,
        crossDomain: false
      };

      // $FlowFixMe: WTF
      return kernelspecs.list(serverConfig).pipe(
        tap(xhr => {
          if (xhr.status !== 200) {
            throw new Error(xhr.response);
          }
        }),
        map(xhr => {
          return {
            type: "KERNELSPECS_LISTED",
            payload: xhr.response
          };
        }),
        catchError((xhrError: any) => of(genericAjaxFail(xhrError)))
      );
    })
  );
}
