import { ajax } from "rxjs/ajax";
import { createAJAXSettings, ServerConfig } from "./base";

/**
 * Creates an AjaxObservable for listing available sessions.
 *
 * @param serverConfig  - The server configuration
 * @param sessionID - Universally unique id for session to be requested.
 *
 * @return An Observable with the request response
 */
export const list = (serverConfig: ServerConfig) =>
  ajax(createAJAXSettings(serverConfig, "/api/sessions"));

/**
 * Creates an AjaxObservable for getting a particular session's information.
 *
 * @param serverConfig  - The server configuration
 * @param sessionID - Universally unique id for session to be requested.
 *
 * @return An Observable with the request/response
 */
export const get = (serverConfig: ServerConfig, sessionID: string) =>
  ajax(createAJAXSettings(serverConfig, `/api/sessions/${sessionID}`));

/**
 * Creates an AjaxObservable for destroying a particular session.
 *
 * @param {Object} serverConfig - The server configuration
 * @param {String} sessionID - unique id for session to be requested.
 *
 * @return {Object} - An Observable with the request/response
 */
export const destroy = (serverConfig: ServerConfig, sessionID: string) =>
  ajax(
    createAJAXSettings(serverConfig, `/api/sessions/${sessionID}`, {
      method: "DELETE"
    })
  );

/**
 * Creates an AjaxObservable for updating a session.
 *
 * @param serverConfig - The server configuration
 * @param sessionID - unique identifier for session to be changed.
 * @param body - Payload containing new kernel_name, new kernel_id,
 * name of the new session, and the new path.
 *
 * @return An Observable with the request/response
 */
export const update = (
  serverConfig: ServerConfig,
  sessionID: string,
  body: object
) =>
  ajax(
    createAJAXSettings(serverConfig, `/api/sessions/${sessionID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body
    })
  );

/**
 * Creates an AjaxObservable for getting a particular session's information.
 *
 * @param serverConfig  - The server configuration
 * @param payload - Payload containing kernel name, kernel_id, session
 * name, and path for creation of a new session.
 * @return An Observable with the request/response
 */
export const create = (serverConfig: ServerConfig, body: object) =>
  ajax(
    createAJAXSettings(serverConfig, "/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body
    })
  );
