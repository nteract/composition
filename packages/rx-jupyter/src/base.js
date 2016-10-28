export function normalizeBaseURL(url) {
  return url.replace(/\/+$/, '');
}

export function createAJAXSettings(serverConfig, uri = '/') {
  const baseURL = normalizeBaseURL(serverConfig.endpoint || serverConfig.url);
  const url = `${baseURL}${uri}`;
  return Object.assign({
    url,
    responseType: 'json',
  }, serverConfig);
}
