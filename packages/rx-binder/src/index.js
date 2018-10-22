// @flow
import { Observable } from "rxjs";

const mybinderURL = "https://mybinder.org";

function cleanRepo(repo) {
  return (
    // trim github.com from repo
    repo
      .replace(/^(https?:\/\/)?github.com\//, "")
      // trim trailing or leading '/' on repo
      .replace(/(^\/)|(\/?$)/g, "")
  );
}

/*::
type BinderOptions = {
  repo: string,
  ref?: string,
  binderURL?: string,
}
*/

export function formBinderURL({
  repo = "jupyter/notebook",
  ref = "master",
  binderURL = mybinderURL
} /*: BinderOptions */ = {}) /*: string */ {
  repo = cleanRepo(repo);
  // trim trailing / on binderURL
  binderURL = binderURL.replace(/(\/?$)/g, "");

  const url = `${binderURL}/build/gh/${repo}/${ref}`;
  return url;
}

const eventSourceFallback =
  typeof window !== "undefined" && window.EventSource
    ? window.EventSource
    : // eslint-disable-next-line no-unused-vars
      function(url: string) {
        throw new Error(
          "Event Source not supported on this platform -- please polyfill"
        );
      };

export function binder(
  options /*: BinderOptions */,
  /** Allow overriding EventSource for testing and ponyfilling **/
  EventSourceDI /* :* */ = eventSourceFallback
) /*: Observable<*> */ {
  if (!EventSourceDI) {
    throw new Error(
      "Event Source not supported on this platform -- please polyfill"
    );
  }

  const url = formBinderURL(options);

  return Observable.create(observer => {
    const es = new EventSourceDI(url);

    es.onmessage = function(evt) {
      const msg = JSON.parse(evt.data);

      // Pass messages onward, closing on "failed" or "ready"
      observer.next(msg);

      switch (msg.phase) {
        case "failed":
          // The message of failed is a message and shouldn't go on the error
          // part of the stream, we should just complete it
          observer.complete();
          break;
        case "ready":
          // When the server is ready, we can close the event source
          observer.complete();
          break;
        default:
          // do nothing, we already sent the message on
          break;
      }
    };

    es.onerror = err => {
      observer.error(err);
    };

    // disposal of the observable closes the EventSource
    return () => {
      es.close();
    };
  });
}
