import { ajax } from 'rxjs/observable/dom/ajax';
import { join as pathJoin } from 'path';

import {
  createAJAXSettings,
  normalizeBaseURL,
} from './base';

function formURI(path) {
  return pathJoin('/api/terminals/', path);
}

/**
 * List all available running terminals.
 * @param {Object} serverConfig  - The server configuration
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function list(serverConfig) {
  const uri = '/api/terminals/';
  const opts = {
    method: 'GET',
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Create a terminal session.
 * @param {Object} serverConfig  - The server configuration
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function create(serverConfig) {
  const uri = '/api/terminals/';
  const opts = {
    method: 'POST',
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Fetch a terminal session.
 * @param {Object} serverConfig  - The server configuration.
 * @param  {string} id - ID of the terminal to be fetched.
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function get(serverConfig, id) {
  const uri = formURI(id);
  const opts = {
    method: 'GET',
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Destroy a running terminal session.
 * @param {Object} serverConfig  - The server configuration.
 * @param  {string} id - ID of the terminal to be fetched.
 * @return {AjaxObservable} An Observable with the request response
 */
export function destroy(serverConfig, id) {
  const uri = formURI(id);
  const opts = {
    method: 'DELETE',
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}


export function formWebSocketURL(serverConfig, id) {
  const baseURL = normalizeBaseURL(serverConfig.endpoint || serverConfig.url);
  const url = `${baseURL}/terminals/websocket/${id}`;
  return url.replace(/^http(s)?/, 'ws$1');
}
