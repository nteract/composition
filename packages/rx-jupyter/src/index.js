// @flow

import { ajax } from "rxjs/observable/dom/ajax";

import * as kernels from "./kernels";
import * as kernelspecs from "./kernelspecs";
import * as sessions from "./sessions";
import * as contents from "./contents";
import * as terminals from "./terminals";

import { createAJAXSettings } from "./base";

function apiVersion(serverConfig: Object) {
  const req = createAJAXSettings(serverConfig, "/api");
  return ajax(req);
}

export { apiVersion, kernels, kernelspecs, sessions, contents, terminals };
