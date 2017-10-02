/* @flow */

import { contents } from "rx-jupyter";

import { toJS, stringifyNotebook } from "@nteract/commutable";

import { of } from "rxjs/observable/of";
import { tap, map, switchMap, catchError } from "rxjs/operators";

import type { ActionsObservable } from "redux-observable";

type SAVE_ACTION = {
  type: "SAVE",
  path: string,
  model: any
};

type LOAD_ACTION = {
  type: "LOAD",
  path: string
};

type LOAD_FAILED_ACTION = {
  type: "LOAD_FAILED",
  payload: any,
  status: number
};

type LOADED_ACTION = {
  type: "LOADED",
  payload: any
};

function save(path: string, model: any): SAVE_ACTION {
  // NOTE: Model can be a notebook or any ol' file
  // TODO: Should serverConfig be passed everytime or yoinked from the store from within the epic (?)
  return {
    type: "SAVE",
    path,
    model
  };
}

function load(path: string): LOAD_ACTION {
  return {
    type: "LOAD",
    path
  };
}

function loadFailed(ajaxError: any): LOAD_FAILED_ACTION {
  return {
    type: "LOAD_FAILED",
    payload: ajaxError.response,
    status: ajaxError.status
  };
}

type CONTENTS_ACTION =
  | SAVE_ACTION
  | LOAD_ACTION
  | LOAD_FAILED_ACTION
  | LOADED_ACTION;

type ServerConfig = {
  endpoint: string,
  crossDomain?: boolean
};

export function loadEpic(
  action$: ActionsObservable<CONTENTS_ACTION>,
  store: Store<*, *>
) {
  return action$.ofType("LOAD").pipe(
    tap((action: LOAD_ACTION) => {
      // If there isn't a filename, save-as it instead
      if (!action.path) {
        throw new Error("load needs a path");
      }
    }),
    switchMap((action: LOAD_ACTION) => {
      const config = store.getState().config;
      // Normalizing to match rx-jupyter vs. the jupyter server config
      const serverConfig = {
        endpoint: config.baseUrl,
        crossDomain: false
      };

      // TODO: make params optional in rx-jupyter
      return contents.get(serverConfig, action.path, {}).pipe(
        tap(xhr => {
          if (xhr.status !== 200) {
            throw new Error(xhr.response);
          }
        }),
        map(xhr => {
          return {
            type: "LOADED",
            payload: xhr.response
          };
        }),
        catchError((xhrError: any) => of(loadFailed(xhrError)))
      );
    })
  );
}
