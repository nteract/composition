import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/operator/map';

export function createSettingsForList(endpoint, crossDomain) {
  const url = endpoint + '/api/kernels';
  return {
    url,
    crossDomain,
    responseType: 'json',
  };
}

export function createSettingsForGet(endpoint, crossDomain, id) {
  const url = endpoint + '/api/kernels/' + id;
  return {
    url,
    crossDomain,
    responseType: 'json',
  };
}

export function createSettingsForStart(endpoint, crossDomain, name, path) {
  const url = endpoint + '/api/kernels';
  return {
    url,
    crossDomain,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {
      path,
      kernel_name: name,
    }
  }
}

export function list(endpoint, crossDomain) {
  return ajax(createSettingsForList(endpoint, crossDomain));
}

export function get(endpoint, crossDomain, id) {
  return ajax(createSettingsForGet(endpoint, crossDomain, id));
}

export function start(endpoint, crossDomain, name, path) {
  return ajax(createSettingsForStart(endpoint, crossDomain, name, path));
}
