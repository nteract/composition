// @flow

export function normalizeBaseURL(url: string): string {
  return url.replace(/\/+$/, "");
}

export function createAJAXSettings(
  serverConfig: Object,
  uri: string = "/",
  opts: Object = {}
): Object {
  const baseURL = normalizeBaseURL(serverConfig.endpoint || serverConfig.url);
  const url = `${baseURL}${uri}`;
  const headers = {
    Authorization: `token ${serverConfig.token ? serverConfig.token : ""}`
  };
  // Merge in our typical settings for responseType, allow setting additional options
  // like the method
  const settings = Object.assign(
    {
      url,
      responseType: "json",
      headers
    },
    serverConfig,
    opts
  );

  delete settings.endpoint;
  return settings;
}
