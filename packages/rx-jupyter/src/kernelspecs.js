// @flow

import { ajax } from "rxjs/ajax";
import type { Observable } from "rxjs";

import { createAJAXSettings } from "./base";

/**
 * Creates an AjaxObservable for listing avaialble kernelspecs.
 *
 * @param {Object}  serverConfig  - The server configuration
 *
 * @return  {Object}  An Observable with the request response
 */
export function list(serverConfig: Object): Observable<*> {
  return ajax(createAJAXSettings(serverConfig, "/api/kernelspecs"));
}

export function get(serverConfig: Object, name: string): Observable<*> {
  return ajax(createAJAXSettings(serverConfig, `/api/kernelspecs/${name}`));
}
