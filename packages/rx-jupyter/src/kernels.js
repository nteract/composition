import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/operator/map';

/**
 * Creates the AJAX settings for a call to the kernels API.
 *
 * @param {Object}  serverConfig  - The server configuration
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForList(serverConfig) {
  const url = `${serverConfig.endpoint}/api/kernels`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

/**
 * Creates the AJAX settings for a call to get details for a single kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForGet(serverConfig, id) {
  const url = `${serverConfig.endpoint}/api/kernels/${id}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

/**
 * Creates the AJAX settings for a cell to start a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  name  - The name of the kernel to start
 * @param {string}  path  - The path the new kernel should start in
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForStart(serverConfig, name, path) {
  const url = `${serverConfig.endpoint}/api/kernels`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {
      path,
      kernel_name: name,
    },
  };
}

/**
 * Creates the AJAX settings for a call to kill a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to kill
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForKill(serverConfig, id) {
  const url = `${serverConfig.endpoint}/api/kernels/${id}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    method: 'DELETE',
  };
}

/**
 * Creates the AJAX settings for a call to interrupt a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to interrupt
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForInterrupt(serverConfig, id) {
  const url = `${serverConfig.endpoint}/api/kernels/${id}/interrupt`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    method: 'POST',
  };
}

/**
 * Creates the AJAX settings for a call to restart a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to restart
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForRestart(serverConfig, id) {
  const url = `${serverConfig.endpoint}/api/kernels/${id}/restart`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    method: 'POST',
  };
}

/**
 * Creates an AjaxObservable for listing running kernels.
 *
 * @param {Object}  serverConfig  - The server configuration
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function list(serverConfig) {
  return ajax(createSettingsForList(serverConfig));
}

/**
 * Creates an AjaxObservable for getting info about a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to fetch
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function get(serverConfig, id) {
  return ajax(createSettingsForGet(serverConfig, id));
}

/**
 * Creates an AjaxObservable for starting a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  name  - The name of the kernel to start
 * @param {string}  path  - The path to start the kernel in
 *
 * @return  {AjaxObserbable}  An Observable with the request response
 */
export function start(serverConfig, name, path) {
  return ajax(createSettingsForStart(serverConfig, name, path));
}

/**
 * Creates an AjaxObservable for killing a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to kill
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function kill(serverConfig, id) {
  return ajax(createSettingsForKill(serverConfig, id));
}

/**
 * Creates an AjaxObservable for interrupting a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to interupt
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function interrupt(serverConfig, id) {
  return ajax(createSettingsForInterrupt(serverConfig, id));
}

/**
 * Creates an AjaxObservable for restarting a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to restart
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function restart(serverConfig, id) {
  return ajax(createSettingsForRestart(serverConfig, id));
}
