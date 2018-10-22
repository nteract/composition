// @flow
import { empty, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { kernelspecs } from "rx-jupyter";
import { ofType } from "redux-observable";
import type { ActionsObservable } from "redux-observable";

import * as actions from "../actions";
import * as actionTypes from "../actionTypes";
import type { FetchKernelspecs } from "../actionTypes";
import * as selectors from "../selectors";

export const fetchKernelspecsEpic = (
  action$: ActionsObservable<redux$Action>,
  state$: any
) =>
  action$.pipe(
    ofType(actionTypes.FETCH_KERNELSPECS),
    mergeMap((action: FetchKernelspecs) => {
      const {
        payload: { hostRef, kernelspecsRef }
      } = action;
      const state = state$.value;

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      return kernelspecs.list(serverConfig).pipe(
        map(data => {
          const defaultKernelName = data.response.default;
          const kernelspecs = {};
          Object.keys(data.response.kernelspecs).forEach(key => {
            const value = data.response.kernelspecs[key];
            kernelspecs[key] = {
              name: value.name,
              resources: value.resources,
              argv: value.spec.argv,
              displayName: value.spec.display_name,
              env: value.spec.env,
              interruptMode: value.spec.interrupt_mode,
              language: value.spec.language,
              metadata: value.spec.metadata
            };
          });
          return actions.fetchKernelspecsFulfilled({
            hostRef,
            kernelspecsRef,
            defaultKernelName,
            kernelspecs
          });
        }),
        catchError(error => {
          return of(actions.fetchKernelspecsFailed({ kernelspecsRef, error }));
        })
      );
    })
  );
