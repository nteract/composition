// @flow

import { ofType } from "redux-observable";

import { catchError, map, mergeMap, switchMap, filter } from "rxjs/operators";
import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";

import { activateKernelFulfilled } from "../actions";

import { makeRemoteKernelRecord } from "@nteract/types/core/records";

import type { AppState, RemoteKernelProps } from "@nteract/types/core/records";

import { kernels, shutdown, kernelspecs } from "rx-jupyter";
import { v4 as uuid } from "uuid";

import {
  ACTIVATE_KERNEL_BY_NAME,
  // TODO: the ACTIVATE_KERNEL action is still coded to desktop
  ACTIVATE_KERNEL
} from "../constants";

import { executeRequest, kernelInfoRequest } from "@nteract/messaging";

const activateKernelEpic = (action$: *, store: *) =>
  action$.pipe(
    ofType(ACTIVATE_KERNEL_BY_NAME),
    map(action => {
      const state: AppState = store.getState();
      return { host: state.app.host, ...action };
    }),
    // Only accept jupyter servers for the host with this epic
    filter(({ host }) => host === "jupyter" && host.serverUrl),
    // TODO: When a switchMap happens, we need to close down the originating
    // kernel, likely by sending a different action
    switchMap(({ payload: { kernelName }, host }) => {
      const config = {
        crossDomain: host.crossDomain,
        token: host.token,
        serverUrl: host.serverUrl
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
              channels: kernels.connect(config, data.response.id, session),
              kernelName: kernelName
            });

            kernel.channels.next(kernelInfoRequest());

            return of({
              type: ACTIVATE_KERNEL,
              payload: kernel
            });
          })
        );
    })
  );
