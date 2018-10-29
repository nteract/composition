import { ajax } from "rxjs/ajax";
import { createAJAXSettings, ServerConfig } from "./base";

import * as kernels from "./kernels";
import * as kernelspecs from "./kernelspecs";
import * as sessions from "./sessions";
import * as contents from "./contents";
import * as terminals from "./terminals";

export const apiVersion = (serverConfig: ServerConfig) =>
  ajax(createAJAXSettings(serverConfig, "/api"));

/**
 * Creates an AjaxObservable for shutting down a notebook server.
 * @param serverConfig  - The server configuration
 * @return  An Observable with the request/response
 */
export const shutdown = (serverConfig: ServerConfig) =>
  ajax(createAJAXSettings(serverConfig, "/api/shutdown", { method: "POST" }));

export { kernels, kernelspecs, sessions, contents, terminals };
