// @flow

import { ajax } from "rxjs/ajax";
import type { Observable } from "rxjs";

import * as kernels from "./kernels";
import * as kernelspecs from "./kernelspecs";
import * as sessions from "./sessions";
import * as contents from "./contents";
import * as terminals from "./terminals";
import { createAJAXSettings } from "./base";

function apiVersion(serverConfig: Object) {
  const req = createAJAXSettings(serverConfig, "/api");
  return ajax(req);
}

/**
 * Creates an AjaxObservable for shutting down a notebook server.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @return  {Object}  An Observable with the request/response
 */
function shutdown(serverConfig: Object): Observable<*> {
  return ajax(
    createAJAXSettings(serverConfig, "/api/shutdown", { method: "POST" })
  );
}

export {
  apiVersion,
  shutdown,
  kernels,
  kernelspecs,
  sessions,
  contents,
  terminals
};
