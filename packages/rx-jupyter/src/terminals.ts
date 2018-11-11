import { ajax } from "rxjs/ajax";
import urljoin from "url-join";
import { Observable } from "rxjs";

import { createAJAXSettings, normalizeBaseURL, ServerConfig } from "./base";

const formURI = (path: string) => urljoin("/api/terminals/", path);

/**
 * List all available running terminals.
 * @param serverConfig  - The server configuration
 * @return An Observable with the request response
 */
export const list = (serverConfig: ServerConfig) =>
  ajax(
    createAJAXSettings(serverConfig, "/api/terminals/", {
      method: "GET"
    })
  );

/**
 * Create a terminal session.
 * @param serverConfig  - The server configuration
 * @return An Observable with the request response
 */
export const create = (serverConfig: ServerConfig) =>
  ajax(
    createAJAXSettings(serverConfig, "/api/terminals/", {
      method: "POST"
    })
  );

/**
 * Fetch a terminal session.
 * @param serverConfig  - The server configuration.
 * @param id - ID of the terminal to be fetched.
 * @return An Observable with the request response
 */
export const get = (serverConfig: ServerConfig, id: string) =>
  ajax(
    createAJAXSettings(serverConfig, formURI(id), {
      method: "GET"
    })
  );

/**
 * Destroy a running terminal session.
 * @param serverConfig  - The server configuration.
 * @param id - ID of the terminal to be fetched.
 * @return An Observable with the request response
 */
export const destroy = (serverConfig: ServerConfig, id: string) =>
  ajax(
    createAJAXSettings(serverConfig, formURI(id), {
      method: "DELETE"
    })
  );

export const formWebSocketURL = (serverConfig: ServerConfig, id: string) => {
  const baseURL = normalizeBaseURL(serverConfig.endpoint || serverConfig.url);
  const url = `${baseURL}/terminals/websocket/${id}`;
  return url.replace(/^http(s)?/, "ws$1");
};
