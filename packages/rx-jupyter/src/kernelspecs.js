import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/operator/map';

/**
 * AJAX settings creators
 */
export function createSettingsForList(serverConfig) {
  const url = `${serverConfig.endpoint}/api/kernelspecs`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

export function list(serverConfig) {
  return ajax(createSettingsForList(serverConfig));
}
