
import { ajax } from 'rxjs/observable/dom/ajax';

export function createSettingsForList(serverConfig) {
  const url = `${serverConfig.endpoint}/api/sessions`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  };
}

export function createSettingsForGet(serverConfig, sessionID) {
  const url = `${serverConfig.endpoint}/api/sessions/${sessionID}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

export function createSettingsForDestroy(serverConfig, sessionID) {
  const url = `${serverConfig.endpoint}/api/sessions/${sessionID}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
    method: 'DELETE',
  };
}

export function createSettingsForRename(serverConfig, sessionID, newSessionName) {
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
      path: '~',
      session_name: newSessionName,
    },
  };
}

export function createSettingsForCreate(serverConfig, { notebook_name, path, kernel_name }) {
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
      session_name: '',
      notebook_name,
      path,
      kernel_name,
    },
  };
}

export function list(serverConfig, sessionID) {
  return ajax(createSettingsForList(serverConfig, sessionID));
}

export function get(serverConfig, sessionID) {
  return ajax(createSettingsForGet(serverConfig, sessionID));
}

export function destroy(serverConfig, sessionID) {
  return ajax(createSettingsForDestroy(serverConfig, sessionID));
}

export function rename(serverConfig, sessionID, newSessionName) {
  return ajax(createSettingsForRename(serverConfig, sessionID, newSessionName));
}

export function create(serverConfig, { notebook_name, path, kernel_name }) {
  return ajax(createSettingsForCreate(serverConfig, { notebook_name, path, kernel_name }));
}
