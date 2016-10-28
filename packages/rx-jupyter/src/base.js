export function normalizeBaseURL(url) {
  return url.replace(/\/+$/, '');
}

export function createAJAXSettings(serverConfig, uri = '/', opts = {}) {
  const baseURL = normalizeBaseURL(serverConfig.endpoint || serverConfig.url);
  const url = `${baseURL}${uri}`;
  const settings = Object.assign({
    url,
    responseType: 'json',
  }, serverConfig, opts);

  delete settings.endpoint;
  return settings;
}
