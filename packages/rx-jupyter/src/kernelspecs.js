import { ajax } from 'rxjs/observable/dom/ajax';

/**
 * Creates the AJAX settings for a call to the kernelspecs API.
 *
 * @param {Object}  serverConfig  - The server configuration
 *
 * @return  {Object}  The settings to be passed to the AJAX request
 */
export function createSettingsForList(serverConfig) {
  const url = `${serverConfig.endpoint}/api/kernelspecs`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

export function createSettingsForGet(serverConfig, name) {
  const url = `${serverConfig.endpoint}/api/kernelspecs/${name}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

/**
 * Creates an AjaxObservable for listing avaialble kernelspecs.
 *
 * @param {Object}  serverConfig  - The server configuration
 *
 * @return  {Object}  An Observable with the request response
 */
export function list(serverConfig) {
  return ajax(createSettingsForList(serverConfig));
}

export function get(serverConfig, name) {
  return ajax(createSettingsForGet(serverConfig, name));
}
