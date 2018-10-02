// @flow

import { ajax } from "rxjs/ajax";
import { webSocket } from "rxjs/webSocket";
import { Observable } from "rxjs";

import { Subject } from "rxjs";
import { Subscriber } from "rxjs";

import { createAJAXSettings } from "./base";

import { retryWhen, tap, delay, share } from "rxjs/operators";

const urljoin = require("url-join");
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
      name
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
  const suffix = q !== "" ? `?${q}` : "";

  const url = urljoin(
    serverConfig.endpoint,
    `/api/kernels/${kernelID}/channels${suffix}`
  );

  return url.replace(/^http(s)?/, "ws$1");
}

export function connect(
  serverConfig: Object,
  kernelID: string,
  sessionID: ?string
): * {
  const wsSubject = webSocket(
    formWebSocketURL(serverConfig, kernelID, sessionID)
  ).pipe(
    retryWhen(error$ => {
      // Keep track of how many times we've already re-tried
      let counter = 0;
      let maxRetries = 100;

      return error$.pipe(
        tap(e => {
          counter++;
          // This will only retry on error when it's a close event that is not
          // from a .complete() of the websocket subject
          if (counter > maxRetries || e instanceof Event === false) {
            console.error(
              `bubbling up Error on websocket after retrying ${counter} times out of ${maxRetries}`,
              e
            );
            throw e;
          } else {
            // We'll retry at this point
            console.log(`attempting to retry kernel connection after error`, e);
          }
        }),
        delay(1000)
      );
    }),
    // The websocket subject is multicast and we need the retryWhen logic to retain that property
    share()
  );

  // Create a subject that does some of the handling inline for the session
  // and ensuring it's serialized
  return Subject.create(
    // $FlowFixMe: figure out if this is a shortcoming in the flow def or our declaration
    Subscriber.create(
      message => {
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
      e => wsSubject.error(e),
      () => wsSubject.complete()
    ), // Subscriber
    // Subject.create takes a subscriber and an observable. We're only overriding
    // the subscriber here so we pass the subject on as an observable as the
    // second argument to Subject.create (since it's _also_ an observable)
    wsSubject
  );
}
