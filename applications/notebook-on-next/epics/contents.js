/* @flow */

import { contents } from "rx-jupyter";

import {
  toJS,
  stringifyNotebook,
  fromJS,
  emptyNotebook
} from "@nteract/commutable";

import { of } from "rxjs/observable/of";
import { from } from "rxjs/observable/from";
import { tap, map, switchMap, catchError } from "rxjs/operators";
import { ofType } from "redux-observable";

import type { ActionsObservable } from "redux-observable";

import type { ALL_ACTIONS } from "../actions";

import type {
  SAVE_ACTION,
  LOAD_ACTION,
  LOAD_FAILED_ACTION
} from "../actions/contents";

function save(path: string, model: any): SAVE_ACTION {
  // NOTE: Model can be a notebook or any ol' file
  // TODO: Should serverConfig be passed everytime or yoinked from the store from within the epic (?)
  return {
    type: "SAVE",
    path,
    model
  };
}

function load(gistid: string): LOAD_ACTION {
  return {
    type: "LOAD",
    gistid: gistid
  };
}

function loadFailed(ajaxError: any): LOAD_FAILED_ACTION {
  return {
    type: "LOAD_FAILED",
    payload: ajaxError.response,
    status: ajaxError.status
  };
}

type ServerConfig = {
  endpoint: string,
  crossDomain?: boolean
};

async function fetchFromGist(gistId) {
  const path = `https://api.github.com/gists/${gistId}`;
  return fetch(path)
    .then(async response => {
      const ghResponse = await response.json();
      for (const file in ghResponse.files) {
        if (/.ipynb$/.test(file)) {
          const fileResponse = ghResponse.files[file];
          if (fileResponse.truncated) {
            return fetch(fileResponse.raw_url).then(resp => resp.json());
          }
          return JSON.parse(fileResponse.content);
        }
      }
    })
    .catch(err => emptyNotebook);
}

export function loadEpic(
  action$: ActionsObservable<ALL_ACTIONS>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType("LOAD"),
    tap((action: LOAD_ACTION) => {
      // If there isn't a filename, save-as it instead
      if (!action.gistid) {
        throw new Error("load needs a gist ID");
      }
    }),
    switchMap((action: LOAD_ACTION) => {
      return from(fetchFromGist(action.gistid));
    }),
    map((notebook: Object) => {
      return {
        type: "LOADED",
        payload: notebook
      };
    })
  );
}
