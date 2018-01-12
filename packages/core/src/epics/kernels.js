// @flow

import { ofType } from "redux-observable";

import { catchError, map, mergeMap, switchMap, filter } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";

import type { AppState } from "@nteract/types/core/records";

import { kernels, shutdown, kernelspecs } from "rx-jupyter";
import { v4 as uuid } from "uuid";

import {
  LAUNCH_KERNEL_BY_NAME,
  // TODO: the NEW_KERNEL action is still coded to desktop
  NEW_KERNEL
} from "../constants";

import { executeRequest, kernelInfoRequest } from "@nteract/messaging";

const activateKernelEpic = (action$: *, store: *) =>
  action$.pipe(
    ofType(LAUNCH_KERNEL_BY_NAME),
    // Only accept jupyter servers for the host with this epic
    filter(action => {
      const state: AppState = store.getState();
      return state.app.getIn(["host", "type"]) === "jupyter";
    }),
    // TODO: When a switchMap happens, we need to close down the originating
    // kernel, likely by sending a different action
    switchMap(({ payload: { kernelName } }) => {
      const state: AppState = store.getState();

      const config = {
        crossDomain: state.app.host.crossDomain,
        token: state.app.host.token,
        serverUrl: state.app.host.serverUrl
      };

      return kernels
        .start(
          config,
          kernelName,
          // TODO: set the current working directory according to what the action says
          ""
        )
        .pipe(
          mergeMap(data => {
            const session = uuid();
            const kernel = Object.assign({}, data.response, {
              channels: kernels.connect(config, data.response.id, session)
            });

            kernel.channels.next(kernelInfoRequest());

            return of({
              type: NEW_KERNEL,
              ...kernel
            });
          })
        );
    })
  );
