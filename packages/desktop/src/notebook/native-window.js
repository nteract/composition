import { remote } from "electron";
import { is } from "immutable";

import path from "path";

import { of } from "rxjs/observable/of";
import { combineLatest } from "rxjs/observable/combineLatest";
import { from } from "rxjs/observable/from";

import {
  map,
  distinctUntilChanged,
  debounceTime,
  switchMap
} from "rxjs/operators";

const HOME = remote.app.getPath("home");

/**
 * Turn a path like /Users/n/mine.ipynb to ~/mine.ipynb
 * @param  {string} p the full path to a file
 * @return {string}   tildified path
 */
export function tildify(p) {
  if (!p) {
    return "";
  }
  const s = path.normalize(p) + path.sep;
  return (s.indexOf(HOME) === 0
    ? s.replace(HOME + path.sep, `~${path.sep}`)
    : s
  ).slice(0, -1);
}

export function setTitleFromAttributes(attributes) {
  const filename = tildify(attributes.fullpath);
  const { executionState } = attributes;

  try {
    const win = remote.getCurrentWindow();
    if (filename && win.setRepresentedFilename) {
      win.setRepresentedFilename(attributes.fullpath);
      win.setDocumentEdited(attributes.modified);
    }
    const title = `${filename} - ${executionState}`;
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

export function createTitleFeed(state$) {
  const modified$ = state$.pipe(
    map(
      state =>
        process.platform === "darwin"
          ? !is(
              state.document.get("savedNotebook"),
              state.document.get("notebook")
            )
          : false
    ),
    distinctUntilChanged()
  );

  const fullpath$ = state$.pipe(
    map(state => state.document.get("filename") || "Untitled")
  );

  const executionState$ = state$.pipe(
    map(state => state.app.get("executionState")),
    debounceTime(200)
  );

  return combineLatest(
    modified$,
    fullpath$,
    executionState$,
    (modified, fullpath, executionState) => ({
      modified,
      fullpath,
      executionState
    })
  ).pipe(distinctUntilChanged(), switchMap(i => of(i)));
}

export function initNativeHandlers(store) {
  const state$ = from(store);

  return createTitleFeed(state$).subscribe(setTitleFromAttributes, err =>
    console.error(err)
  );
}
