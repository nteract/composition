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
 * @param {String} body - New name and/or path for session with param sessionID.
 *
 * @return  {Object} - The settings to be passed to the AJAX request
 */
export function createSettingsForUpdate(serverConfig, sessionID, body) {
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
      kernel: { name: body['kernel_name'], id: body['kernel_id'] },
      name: body['name'],
      path: body['path'],
      type: body['type'],
    },
  };
}

/**
 * Creates the AJAX settings for a call to the sessions API.
 *
 * @param {Object} serverConfig  - The server configuration
 *
 * @param {Object} body - Object containing notebook_name, path, type kernel_name for request
 *
 * @return {Object} - The settings to be passed to the AJAX request
 */
export function createSettingsForCreate(serverConfig, body) {
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
      kernel: { name: body['kernel_name'], id: body['kernel_id'] },
      name: body['name'],
      path: body['path'],
      type: body['type'],
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
 * Creates an AjaxObservable for updating a session.
 *
 * @param {Object} serverConfig - The server configuration
 *
 * @param {String} sessionID - Universally unique identifier for session to be changed.
 *
 * @param {String} body - Payload containing new kernel_name, new kernel_id,
 * name of the new session, and the new path.
 *
 * @return  {Object}  An Observable with the request/response
 */
export function update(serverConfig, sessionID, body) {
  return ajax(createSettingsForUpdate(serverConfig, sessionID, body));
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
export function create(serverConfig, body) {
  return ajax(createSettingsForCreate(serverConfig, body));
}
