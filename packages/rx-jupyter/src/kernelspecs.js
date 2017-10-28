// @flow

import { ajax } from 'rxjs/observable/dom/ajax';

import {
  createAJAXSettings,
} from './base';

/**
 * Creates an AjaxObservable for listing avaialble kernelspecs.
 *
 * @param {Object}  serverConfig  - The server configuration
 *
 * @return  {Object}  An Observable with the request response
 */
export function list(serverConfig : Object) {
  return ajax(createAJAXSettings(serverConfig, '/api/kernelspecs'));
}

export function get(serverConfig : Object, name : string) {
  return ajax(createAJAXSettings(serverConfig, `/api/kernelspecs/${name}`));
}
