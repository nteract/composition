// Vendor modules
import { BookstoreDataModel, ServerConfig } from "@nteract/types";
import { Observable } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import urljoin from "url-join";

// Local modules
import { createAJAXSettings } from "./base";

const formURI = (path: string) => urljoin("/api/bookstore/publish", path);

/**
 * Creates an AjaxObservable for publishing content to `Bookstore`
 * https://github.com/nteract/bookstore
 *
 * @param serverConfig The server configuration
 * @param path The path to the content
 * @param model The data to send in the server request
 *
 * @returns An Observable with the request response
 */
export function publish(
  serverConfig: ServerConfig,
  path: string,
  model: BookstoreDataModel
): Observable<AjaxResponse> {
  return ajax(
    createAJAXSettings(serverConfig, formURI(path), {
      body: model,
      headers: {
        "Content-Type": "application/json"
      },
      method: "PUT"
    })
  );
}
