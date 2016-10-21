import { ajax } from 'rxjs/observable/dom/ajax';

/**
 * Creates the AJAX settings for a call to the sessions API.
 *
 * @param {Object} serverConfig - The server configuration
 *
 * @return {Object} settings - The settings to be passed to the AJAX request
 */
export function createSettingsForList(serverConfig) {
  const url = `${serverConfig.endpoint}/api/sessions`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

/**
 * Creates the AJAX settings for a call to the sessions API.
 *
 * @param {Object} serverConfig - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be requested.
 *
 * @return {Object} - The settings to be passed to the AJAX request
 */
export function createSettingsForGet(serverConfig, sessionID) {
  const url = `${serverConfig.endpoint}/api/sessions/${sessionID}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

/**
 * Creates the AJAX settings for a call to the sessions API.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be requested.
 *
 * @return {Object} - The settings to be passed to the AJAX request
 */
export function createSettingsForDestroy(serverConfig, sessionID) {
  const url = `${serverConfig.endpoint}/api/sessions/${sessionID}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    method: 'DELETE',
  };
}

/**
 * Creates the AJAX settings for a call to the sessions API.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be requested.
 *
 * @param {String} payload - New name and/or path for session with param sessionID.
 *
 * @return  {Object} - The settings to be passed to the AJAX request
 */
export function createSettingsForRename(serverConfig, sessionID, { path, new_session_name }) {
  const url = `${serverConfig.endpoint}/api/sessions/${sessionID}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
    body: {
      path,
      new_session_name,
    },
  };
}

/**
 * Creates the AJAX settings for a call to the sessions API.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {Object} payload - Object containing notebook_name, path, type kernel_name for request
 *
 * @return {Object} - The settings to be passed to the AJAX request
 */
export function createSettingsForCreate(serverConfig, { notebook_name, path, type, kernel_name }) {
  const url = `${serverConfig.endpoint}/api/sessions`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {
      notebook_name,
      path,
      type,
      kernel_name,
    },
  };
}

/**
 * Creates an AjaxObservable for listing available sessions.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be requested.
 *
 * @return  {Object}  An Observable with the request response
 */
export function list(serverConfig, sessionID) {
  return ajax(createSettingsForList(serverConfig, sessionID));
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
export function get(serverConfig, sessionID) {
  return ajax(createSettingsForGet(serverConfig, sessionID));
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
export function destroy(serverConfig, sessionID) {
  return ajax(createSettingsForDestroy(serverConfig, sessionID));
}

/**
 * Creates an AjaxObservable for renaming a session given its sessionID.
 *
 * @param {Object} serverConfig - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be requested.
 *
 * @param {String} payload - New name and/or path for session with param sessionID.
 *
 * @return  {Object}  An Observable with the request/response
 */
export function rename(serverConfig, sessionID, { path, new_session_name }) {
  return ajax(createSettingsForRename(serverConfig, sessionID, { path, new_session_name }));
}

/**
 * Creates an AjaxObservable for getting a particular session's information.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {Object} payload - Object containing notebook_name, path, and kernel_name for request
 *
 * @return {Object} - An Observable with the request/response
 */
export function create(serverConfig, { notebook_name, path, kernel_name }) {
  return ajax(createSettingsForCreate(serverConfig, { notebook_name, path, kernel_name }));
}
