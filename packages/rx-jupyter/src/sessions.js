// @flow

import { ajax } from "rxjs/ajax";
import type { Observable } from "rxjs";

import { createAJAXSettings } from "./base";

/**
 * Creates an AjaxObservable for listing available sessions.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be requested.
 *
 * @return  {Object}  An Observable with the request response
 */
export function list(serverConfig: Object): Observable<*> {
  return ajax(createAJAXSettings(serverConfig, "/api/sessions"));
}

/**
 * Creates an AjaxObservable for getting a particular session's information.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be requested.
 *
 * @return  {Object}  An Observable with the request/response
 */
export function get(serverConfig: Object, sessionID: string): Observable<*> {
  return ajax(createAJAXSettings(serverConfig, `/api/sessions/${sessionID}`));
}

/**
 * Creates an AjaxObservable for destroying a particular session.
 *
 * @param {Object} serverConfig - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be requested.
 *
 * @return {Object} - An Observable with the request/response
 */
export function destroy(
  serverConfig: Object,
  sessionID: string
): Observable<*> {
  return ajax(
    createAJAXSettings(serverConfig, `/api/sessions/${sessionID}`, {
      method: "DELETE"
    })
  );
}

/**
 * Creates an AjaxObservable for updating a session.
 *
 * @param {Object} serverConfig - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be changed.
 *
 * @param {Object} body - Payload containing new kernel_name, new kernel_id,
 * name of the new session, and the new path.
 *
 * @return  {Object}  An Observable with the request/response
 */
export function update(
  serverConfig: Object,
  sessionID: string,
  body: Object
): Observable<*> {
  return ajax(
    createAJAXSettings(serverConfig, `/api/sessions/${sessionID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body
    })
  );
}

/**
 * Creates an AjaxObservable for getting a particular session's information.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {Object} payload - Payload containing kernel name, kernel_id, session
 * name, and path for creation of a new session.
 *
 * @return {Object} - An Observable with the request/response
 */
export function create(serverConfig: Object, body: Object): Observable<*> {
  return ajax(
    createAJAXSettings(serverConfig, "/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body
    })
  );
}
