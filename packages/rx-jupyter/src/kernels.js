import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/operator/map';

export function createSettingsForList(serverConfig) {
  const url = `${serverConfig.endpoint}/api/kernels`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

export function createSettingsForGet(serverConfig, id) {
  const url = `${serverConfig.endpoint}/api/kernels/${id}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

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

export function list(serverConfig) {
  return ajax(createSettingsForList(serverConfig));
}

export function get(serverConfig, id) {
  return ajax(createSettingsForGet(serverConfig, id));
}

export function start(serverConfig, name, path) {
  return ajax(createSettingsForStart(serverConfig, name, path));
}
