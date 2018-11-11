/* @flow */
import path from "path";

import { remote } from "electron";
import { selectors } from "@nteract/core";
import type { ContentRef, KernelRef, AppState } from "@nteract/core";
import { empty, of, from, combineLatest } from "rxjs";
import {
  map,
  distinctUntilChanged,
  debounceTime,
  switchMap,
  mergeMap,
  share
} from "rxjs/operators";

const HOME = remote.app.getPath("home");

/**
 * Turn a path like /Users/n/mine.ipynb to ~/mine.ipynb
 * @param  {string} p the full path to a file
 * @return {string}   tildified path
 */
export function tildify(p: ?string) {
  if (!p) {
    return "";
  }
  const s = path.normalize(p) + path.sep;
  return (s.indexOf(HOME) === 0
    ? s.replace(HOME + path.sep, `~${path.sep}`)
    : s
  ).slice(0, -1);
}

export function setTitleFromAttributes(attributes: *) {
  const filename = tildify(attributes.fullpath);
  const { kernelStatus } = attributes;

  try {
    const win = remote.getCurrentWindow();
    if (filename && win.setRepresentedFilename) {
      win.setRepresentedFilename(attributes.fullpath);
      win.setDocumentEdited(attributes.modified);
    }
    const title = `${filename} - ${kernelStatus}`;
    win.setTitle(title);
  } catch (e) {
    /* istanbul ignore next */
    (function log1277() {
      console.error(
        "Unable to set the filename, see https://github.com/nteract/nteract/issues/1277"
      );
      console.error(e);
      console.error(e.stack);
    })();
  }
}

export function createTitleFeed(contentRef: ContentRef, state$: *) {
  const content$ = state$.pipe(
    mergeMap((state: AppState) => {
      const content = selectors.content(state, { contentRef });
      if (content) {
        return of(content);
      } else {
        return empty();
      }
    })
  );

  const fullpath$ = content$.pipe(
    map(content => content.filepath || "Untitled"),
    distinctUntilChanged()
  );

  // $FlowFixMe somehow isDirty confuses flow
  const modified$ = content$.pipe(
    map(content => selectors.notebook.isDirty(content.model)),
    distinctUntilChanged()
  );

  const kernelRef$ = content$.pipe(
    mergeMap(content => {
      if (content && content.type === "notebook") {
        // FIXME COME BACK TO HERE, we need to strip off the kernelRef
        // const kernelRef = content.model.kernelRef;
        return of(content.model.kernelRef);
      } else {
        return empty();
      }
    })
  );

  const kernelStatus$ = combineLatest(
    state$,
    kernelRef$,
    (state: AppState, kernelRef: KernelRef) => {
      const kernel = selectors.kernel(state, { kernelRef });
      if (!kernel) {
        return "not connected";
      } else {
        return kernel.status;
      }
    }
  ).pipe(debounceTime(200));

  return combineLatest(
    modified$,
    fullpath$,
    kernelStatus$,
    (modified, fullpath, kernelStatus) => ({
      modified,
      fullpath,
      kernelStatus
    })
  ).pipe(
    distinctUntilChanged(),
    switchMap(i => of(i))
  );
}

export function initNativeHandlers(contentRef: ContentRef, store: any) {
  const state$ = from(store).pipe(share());

  return createTitleFeed(contentRef, state$).subscribe(
    setTitleFromAttributes,
    err => console.error(err)
  );
}
