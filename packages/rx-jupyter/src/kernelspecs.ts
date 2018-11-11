import { ajax } from "rxjs/ajax";
import { createAJAXSettings, ServerConfig } from "./base";

/**
 * Creates an AjaxObservable for listing avaialble kernelspecs.
 *
 * @param serverConfig  - The server configuration
 *
 * @return An Observable with the request response
 */
export const list = (serverConfig: ServerConfig) =>
  ajax(createAJAXSettings(serverConfig, "/api/kernelspecs"));

export const get = (serverConfig: ServerConfig, name: string) =>
  ajax(createAJAXSettings(serverConfig, `/api/kernelspecs/${name}`));
