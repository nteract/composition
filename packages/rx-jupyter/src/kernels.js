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

export function createSettingsForKill(serverConfig, id) {
  const url = `${serverConfig.endpoint}/api/kernels/${id}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    method: 'DELETE',
  };
}

export function createSettingsForInterrupt(serverConfig, id) {
  const url = `${serverConfig.endpoint}/api/kernels/${id}/interrupt`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    method: 'POST',
  };
}

export function createSettingsForRestart(serverConfig, id) {
  const url = `${serverConfig.endpoint}/api/kernels/${id}/restart`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    method: 'POST',
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

export function kill(serverConfig, id) {
  return ajax(createSettingsForKill(serverConfig, id));
}

export function interrupt(serverConfig, id) {
  return ajax(createSettingsForInterrupt(serverConfig, id));
}

export function restart(serverConfig, id) {
  return ajax(createSettingsForRestart(serverConfig, id));
}
