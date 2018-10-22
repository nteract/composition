// @flow

import { ActionsObservable, combineEpics, ofType } from "redux-observable";
import { from, merge } from "rxjs";
import { filter, catchError, mergeMap, switchMap } from "rxjs/operators";
import { binder } from "rx-binder";
import { kernels, shutdown, kernelspecs } from "rx-jupyter";
import uuid from "uuid/v4";
import { executeRequest, kernelInfoRequest } from "@nteract/messaging";
import objectPath from "object-path";

import * as actions from "./actions";
import * as actionTypes from "./actionTypes";

const of = ActionsObservable.of;

declare var EventSource: (url: string) => *;

const activateServerEpic = action$ =>
  action$.pipe(
    ofType(actionTypes.ACTIVATE_SERVER),
    // Definitely do not run this on the server side
    filter(() => typeof window !== "undefined"),
    switchMap(({ payload: { serverId, oldServerId, repo, gitref } }) => {
      return binder({ repo, gitref }, EventSource).pipe(
        mergeMap(message => {
          const actionsArray = [
            actions.addServerMessage({ serverId, message })
          ];
          if (message.phase === "ready") {
            const config = {
              endpoint: message.url.replace(/\/\s*$/, ""),
              uri: "/",
              token: message.token,
              crossDomain: true
            };
            actionsArray.push(
              actions.activateServerFulfilled({ serverId, config })
            );
            actionsArray.push(actions.fetchKernelSpecs({ serverId }));
            if (oldServerId) {
              // TODO: kill server epic doesn't exist yet to handle this.
              // TODO: the server will be culled once we do a jupyter shutdown call
              actionsArray.push(actions.killServer({ serverId: oldServerId }));
            }
          }
          // $FlowFixMe
          return of(...actionsArray);
        }),
        catchError(error =>
          of(actions.activateServerFailed({ serverId, error }))
        )
      );
    })
  );

const killServerEpic = (action$, state$) =>
  action$.pipe(
    ofType(actionTypes.KILL_SERVER),
    mergeMap(({ payload: { serverId } }) => {
      const oldServer = state$.value.entities.serversById[serverId];
      if (!oldServer)
        return of(
          actions.killServerFailed({
            serverId,
            error: `server with id ${serverId} does not exist in store.`
          })
        );
      const { config } = oldServer.server;
      return shutdown(config).pipe(
        mergeMap(() => of(actions.killServerFulfilled({ serverId }))),
        catchError(error => of(actions.killServerFailed({ serverId, error })))
      );
    })
  );

const fetchKernelSpecsEpic = (action$, state$) =>
  action$.pipe(
    ofType(actionTypes.FETCH_KERNEL_SPECS),
    mergeMap(({ payload: { serverId } }) => {
      const { config } = state$.value.entities.serversById[serverId].server;
      return kernelspecs.list(config).pipe(
        mergeMap(data => {
          const kernelName = data.response.default;
          return of(
            actions.fetchKernelSpecsFulfilled({
              serverId,
              response: data.response
            }),
            actions.setActiveKernel({ serverId, kernelName })
          );
        }),
        catchError(error =>
          of(actions.fetchKernelSpecsFailed({ serverId, error }))
        )
      );
    })
  );

const setActiveKernelEpic = (action$, state$) =>
  action$.pipe(
    ofType(actionTypes.SET_ACTIVE_KERNEL),
    mergeMap(({ payload: { serverId, kernelName } }) => {
      const channelPath = [
        "entities",
        "serversById",
        serverId,
        "server",
        "activeKernelsByName",
        kernelName,
        "kernel",
        "channel"
      ];
      const channel = objectPath.get(state$.value, channelPath);
      const actionsArray = [actions.setCurrentKernelName(kernelName)];
      if (!channel) {
        actionsArray.push(actions.activateKernel({ serverId, kernelName }));
      }
      // $FlowFixMe
      return of(...actionsArray);
    })
  );

const extractCodeMirrorModeEpic = action$ =>
  action$.pipe(
    ofType(actionTypes.SET_ACTIVE_KERNEL_LANGUAGE_INFO),
    switchMap(({ payload }) => {
      const { languageInfo } = payload;
      return of(
        actions.setCodeMirrorMode(
          languageInfo.codemirror_mode || languageInfo.name || ""
        )
      );
    })
  );

const initializeKernelMessaging = action$ =>
  action$.pipe(
    ofType(actionTypes.ACTIVATE_KERNEL_FULFILLED),
    // When new kernels come in we should drop our old message handling
    switchMap(({ payload }) => {
      const { kernel, kernelName, serverId } = payload;
      // Side effect! Get that Kernel Info!
      kernel.channel.next(kernelInfoRequest());
      return kernel.channel.pipe(
        mergeMap(message => {
          const actionsArray = [
            actions.addKernelMessage({ serverId, kernelName, message })
          ];
          switch (message.header.msg_type) {
            case "status":
              actionsArray.push(
                actions.setKernelStatus({
                  serverId,
                  kernelName,
                  status: message.content.execution_state
                })
              );
              break;
            case "kernel_info_reply":
              actionsArray.push(
                actions.setActiveKernelLanguageInfo({
                  serverId,
                  kernelName,
                  languageInfo: message.content.language_info
                })
              );
              break;
            case "display_data":
            case "execute_result":
            case "stream":
            case "error":
              actionsArray.push(
                actions.addKernelOutput({
                  serverId,
                  kernelName,
                  output: {
                    ...message.content,
                    output_type: message.header.msg_type
                  }
                })
              );
              break;
            default:
              break;
          }
          return from(actionsArray);
        })
      );
    })
  );

const activateKernelEpic = (action$, state$) =>
  action$.pipe(
    ofType(actionTypes.ACTIVATE_KERNEL),
    mergeMap(({ payload: { serverId, kernelName } }) => {
      const configPath = [
        "entities",
        "serversById",
        serverId,
        "server",
        "config"
      ];
      const config = objectPath.get(state$.value, configPath);
      return kernels.start(config, kernelName, "").pipe(
        mergeMap(data => {
          const session = uuid();
          const kernel = Object.assign({}, data.response, {
            channel: kernels.connect(
              config,
              data.response.id,
              session
            )
          });

          kernel.channel.next(kernelInfoRequest());

          return merge(
            of(
              actions.activateKernelFulfilled({
                serverId,
                kernelName,
                kernel
              })
            )
          );
        })
      );
    })
  );

const runSourceEpic = (action$, state$) =>
  action$.pipe(
    ofType(actionTypes.RUN_SOURCE),
    mergeMap(({ payload: { serverId, kernelName, source } }) => {
      const channelPath = [
        "entities",
        "serversById",
        serverId,
        "server",
        "activeKernelsByName",
        kernelName,
        "kernel",
        "channel"
      ];
      const channel = objectPath.get(state$.value, channelPath);
      if (channel) {
        channel.next(executeRequest(source));
      }
      return of(
        actions.clearKernelOutputs({ serverId, kernelName }),
        actions.setSource(source)
      );
    })
  );

// $FlowFixMe
const epics = combineEpics(
  activateServerEpic,
  killServerEpic,
  fetchKernelSpecsEpic,
  setActiveKernelEpic,
  activateKernelEpic,
  initializeKernelMessaging,
  extractCodeMirrorModeEpic,
  runSourceEpic
);

export default epics;
