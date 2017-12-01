// @flow

import { ajax } from "rxjs/observable/dom/ajax";
import { webSocket } from "rxjs/observable/dom/webSocket";
import { Observable } from "rxjs/Observable";

import { Subject } from "rxjs/Subject";
import { Subscriber } from "rxjs/Subscriber";

import { createAJAXSettings } from "./base";

const URLSearchParams = require("url-search-params");

/**
 * Creates an AjaxObservable for listing running kernels.
 *
 * @param {Object}  serverConfig  - The server configuration
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function list(serverConfig: Object): Observable<*> {
  return ajax(createAJAXSettings(serverConfig, "/api/kernels"));
}

/**
 * Creates an AjaxObservable for getting info about a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to fetch
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function get(serverConfig: Object, id: string): Observable<*> {
  return ajax(createAJAXSettings(serverConfig, `/api/kernels/${id}`));
}

/**
 * Creates an AjaxObservable for starting a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  name  - The name of the kernel to start
 * @param {string}  path  - The path to start the kernel in
 *
 * @return  {AjaxObserbable}  An Observable with the request response
 */
export function start(
  serverConfig: Object,
  name: string,
  path: string
): Observable<*> {
  const startSettings = createAJAXSettings(serverConfig, "/api/kernels", {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: {
      path,
      kernel_name: name
    }
  });
  return ajax(startSettings);
}

/**
 * Creates an AjaxObservable for killing a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to kill
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function kill(serverConfig: Object, id: string): Observable<*> {
  return ajax(
    createAJAXSettings(serverConfig, `/api/kernels/${id}`, { method: "DELETE" })
  );
}

/**
 * Creates an AjaxObservable for interrupting a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to interupt
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function interrupt(serverConfig: Object, id: string): Observable<*> {
  return ajax(
    createAJAXSettings(serverConfig, `/api/kernels/${id}/interrupt`, {
      method: "POST"
    })
  );
}

/**
 * Creates an AjaxObservable for restarting a kernel.
 *
 * @param {Object}  serverConfig  - The server configuration
 * @param {string}  id  - The id of the kernel to restart
 *
 * @return  {AjaxObservable}  An Observable with the request response
 */
export function restart(serverConfig: Object, id: string): Observable<*> {
  return ajax(
    createAJAXSettings(serverConfig, `/api/kernels/${id}/restart`, {
      method: "POST"
    })
  );
}

export function formWebSocketURL(
  serverConfig: Object,
  kernelID: string,
  sessionID: ?string
): string {
  const params = new URLSearchParams();
  if (serverConfig.token) {
    params.append("token", serverConfig.token);
  }
  if (sessionID) {
    params.append("session_id", sessionID);
  }

  const q = params.toString();

  const url = `${serverConfig.endpoint}/api/kernels/${kernelID}/channels?${q}`;
  return url.replace(/^http(s)?/, "ws$1");
}

export function connect(
  serverConfig: Object,
  kernelID: string,
  sessionID: ?string
): * {
  const wsSubject = webSocket(
    formWebSocketURL(serverConfig, kernelID, sessionID)
  );

  // Create a subject that does some of the handling inline for the session
  // and ensuring it's serialized
  return Subject.create(
    Subscriber.create({
      next: message => {
        if (typeof message === "string") {
          // Assume serialized
          wsSubject.next(message);
        } else if (typeof message === "object") {
          const sessionizedMessage = Object.assign({}, message, {
            header: Object.assign(
              {},
              {
                session: sessionID
              },
              message.header
            )
          });

          wsSubject.next(JSON.stringify(sessionizedMessage));
        } else {
          console.error(
            "Message must be a string or object, app sent",
            message
          );
        }
      },
      error: e => wsSubject.error(e),
      complete: () => wsSubject.complete()
    }), // Subscriber
    // Subject.create takes a subscriber and an observable. We're only overriding
    // the subscriber here so we pass the subject on as an observable as the
    // second argument to Subject.create (since it's _also_ an observable)
    // $FlowFixMe: update the flow definition to allow this
    wsSubject
  );
}
