// @flow

import { ajax } from "rxjs/observable/dom/ajax";
import Observable from "rxjs/Observable";

import { createAJAXSettings, normalizeBaseURL } from "./base";

const urljoin = require("url-join");

function formURI(path: string) {
  return urljoin("/api/terminals/", path);
}

/**
 * List all available running terminals.
 * @param {Object} serverConfig  - The server configuration
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function list(serverConfig: Object): Observable<*> {
  const uri = "/api/terminals/";
  const opts = {
    method: "GET"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Create a terminal session.
 * @param {Object} serverConfig  - The server configuration
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function create(serverConfig: Object): Observable<*> {
  const uri = "/api/terminals/";
  const opts = {
    method: "POST"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Fetch a terminal session.
 * @param {Object} serverConfig  - The server configuration.
 * @param  {string} id - ID of the terminal to be fetched.
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function get(serverConfig: Object, id: string): Observable<*> {
  const uri = formURI(id);
  const opts = {
    method: "GET"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

/**
 * Destroy a running terminal session.
 * @param {Object} serverConfig  - The server configuration.
 * @param  {string} id - ID of the terminal to be fetched.
 * @return {AjaxObservable} An Observable with the request response
 */
export function destroy(serverConfig: Object, id: string): Observable<*> {
  const uri = formURI(id);
  const opts = {
    method: "DELETE"
  };
  return ajax(createAJAXSettings(serverConfig, uri, opts));
}

export function formWebSocketURL(serverConfig: Object, id: string): string {
  const baseURL = normalizeBaseURL(serverConfig.endpoint || serverConfig.url);
  const url = `${baseURL}/terminals/websocket/${id}`;
  return url.replace(/^http(s)?/, "ws$1");
}
