
import { ajax } from 'rxjs/observable/dom/ajax';

export function createSettingsForList(serverConfig) {
  const url = `${serverConfig.endpoint}/api/sessions`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  }
}

export function createSettingsForGet(serverConfig, sessionID) {
  const url = `${serverConfig.endpoint}/api/sessions/` + sessionID;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  }
}

export function createSettingsForDestroy(serverConfig, sessionID) {
  const url = `${serverConfig.endpoint}/api/sessions/${sessionID}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  }
}

export function createSettingsForRename(serverConfig, sessionID, newSessionName) {
  const url = `${serverConfig.endpoint}/api/sessions/${sessionID}`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  }
}

export function createSettingsForCreate(serverConfig,  { notebookName, path, kernelName }) {
  const url = `${serverConfig.endpoint}/api/sessions/`;
  return {
    url,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  }
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

export function create(serverConfig, { notebookName, path, kernelName }) {
  return ajax(createSettingsForCreate(serverConfig, { notebookName, path, kernelName}))
}
