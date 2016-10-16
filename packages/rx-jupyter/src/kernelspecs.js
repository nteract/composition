import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/operator/map';

/**
 * AJAX settings creators
 */
export function createSettingsForList(endpoint, crossDomain) {
  const url = endpoint + '/api/kernelspecs';
  return {
    url,
    crossDomain,
    responseType: 'json',
  };
}

export function list(endpoint, crossDomain) {
  return ajax(createSettingsForList(endpoint, crossDomain));
}
