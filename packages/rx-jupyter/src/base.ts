import Cookies from "js-cookie";
import { AjaxRequest } from "rxjs/ajax";

export const normalizeBaseURL = (url = "") => url.replace(/\/+$/, "");

export interface ServerConfig extends Partial<AjaxRequest> {
  endpoint?: string;
  url?: string;
  token?: string;
}

export const createAJAXSettings = (
  serverConfig: ServerConfig,
  uri = "/",
  opts: Partial<AjaxRequest> = {}
): AjaxRequest => {
  const baseURL = normalizeBaseURL(serverConfig.endpoint || serverConfig.url);
  const url = `${baseURL}${uri}`;
  const xsrfToken = Cookies.get("_xsrf");
  const headers = {
    "X-XSRFToken": xsrfToken,
    Authorization: `token ${serverConfig.token ? serverConfig.token : ""}`
  };

  // Merge in our typical settings for responseType, allow setting additional
  // options like the method
  const settings = {
    url,
    responseType: "json",
    createXHR: () => new XMLHttpRequest(),
    ...serverConfig,
    ...opts,
    // Make sure we merge in the auth headers with user given headers
    headers: { ...headers, ...opts.headers }
  };
  delete settings.endpoint;
  return settings;
};
