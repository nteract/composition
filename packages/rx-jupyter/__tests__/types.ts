import { Observable } from "rxjs";
import { AjaxResponse } from "rxjs/ajax";

/**
 * expose a private request property used in tests. From comment in Ajax code:
 *
 *   A string of the URL to make the Ajax call.
 *   An object with the following properties
 *   - url: URL of the request
 *   - body: The body of the request
 *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
 *   - async: Whether the request is async
 *   - headers: Optional headers
 *   - crossDomain: true if a cross domain request, else false
 *   - createXHR: a function to override if you need to use an alternate
 *   XMLHttpRequest implementation.
 *   - resultSelector: a function to use to alter the output value type of
 *   the Observable. Gets {@link AjaxResponse} as an argument.
 *
 */
export interface AjaxObservable extends Observable<AjaxResponse> {
  request: {
    url: string;
    body: any;
    method: string;
    async: boolean;
    headers: { [header: string]: any };
    crossDomain: boolean;
    createXHR: typeof XMLHttpRequest;
    responseType: string;
  };
}
