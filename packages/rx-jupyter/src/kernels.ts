import { ajax } from "rxjs/ajax";
import { webSocket } from "rxjs/webSocket";
import { Subject, Subscriber } from "rxjs";
import { retryWhen, tap, delay, share } from "rxjs/operators";
import { createAJAXSettings, ServerConfig } from "./base";
import urljoin from "url-join";
import URLSearchParams from "url-search-params";

/**
 * Creates an AjaxObservable for listing running kernels.
 *
 * @param serverConfig  - The server configuration
 *
 * @return  Observable with the request response
 */
export const list = (serverConfig: ServerConfig) =>
  ajax(createAJAXSettings(serverConfig, "/api/kernels"));

/**
 * Creates an AjaxObservable for getting info about a kernel.
 *
 * @param serverConfig  - The server configuration
 * @param id  - The id of the kernel to fetch
 *
 * @return An Observable with the request response
 */
export const get = (serverConfig: ServerConfig, id: string) =>
  ajax(createAJAXSettings(serverConfig, `/api/kernels/${id}`));

/**
 * Creates an AjaxObservable for starting a kernel.
 *
 * @param serverConfig  - The server configuration
 * @param name  - The name of the kernel to start
 * @param path  - The path to start the kernel in
 *
 * @return An Observable with the request response
 */
export const start = (serverConfig: ServerConfig, name: string, path: string) =>
  ajax(
    createAJAXSettings(serverConfig, "/api/kernels", {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: { path, name }
    })
  );

/**
 * Creates an AjaxObservable for killing a kernel.
 *
 * @param serverConfig  - The server configuration
 * @param id  - The id of the kernel to kill
 *
 * @return An Observable with the request response
 */
export const kill = (serverConfig: ServerConfig, id: string) =>
  ajax(
    createAJAXSettings(serverConfig, `/api/kernels/${id}`, { method: "DELETE" })
  );

/**
 * Creates an AjaxObservable for interrupting a kernel.
 *
 * @param serverConfig  - The server configuration
 * @param id  - The id of the kernel to interupt
 *
 * @return An Observable with the request response
 */
export const interrupt = (serverConfig: ServerConfig, id: string) =>
  ajax(
    createAJAXSettings(serverConfig, `/api/kernels/${id}/interrupt`, {
      method: "POST"
    })
  );

/**
 * Creates an AjaxObservable for restarting a kernel.
 *
 * @param serverConfig  - The server configuration
 * @param id  - The id of the kernel to restart
 *
 * @return An Observable with the request response
 */
export const restart = (serverConfig: ServerConfig, id: string) =>
  ajax(
    createAJAXSettings(serverConfig, `/api/kernels/${id}/restart`, {
      method: "POST"
    })
  );

export const formWebSocketURL = (
  serverConfig: ServerConfig,
  kernelID: string,
  sessionID?: string
): string => {
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
    serverConfig.endpoint || "",
    `/api/kernels/${kernelID}/channels${suffix}`
  );

  return url.replace(/^http(s)?/, "ws$1");
};

export const connect = (
  serverConfig: ServerConfig,
  kernelID: string,
  sessionID?: string
) => {
  const wsSubject = webSocket<string>(
    formWebSocketURL(serverConfig, kernelID, sessionID)
  );

  wsSubject.pipe(
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
    Subscriber.create(
      (message: string | any) => {
        if (typeof message === "string") {
          // Assume serialized
          wsSubject.next(message);
        } else if (typeof message === "object") {
          const sessionizedMessage = {
            ...message,
            header: {
              session: sessionID,
              ...message.header
            }
          };

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
    // Subject.create takes a subscriber and an observable. We're only
    // overriding the subscriber here so we pass the subject on as an
    // observable as the second argument to Subject.create (since it's
    // _also_ an observable)
    wsSubject
  );
};
