import { remote } from "electron";

import path from "path";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/observable/combineLatest";

import "rxjs/add/operator/map";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/pluck";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/debounceTime";

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
    : s).slice(0, -1);
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
  const modified$ = state$
    .map(state => ({
      // Assume not modified to start
      modified: false,
      notebook: state.document.get("notebook")
    }))
    .distinctUntilChanged(last => last.notebook)
    .scan((last, current) => ({
      // We're missing logic for saved...
      // All we know is if it was modified from last time
      // The logic should be
      //    modified: saved.notebook !== current.notebook
      //        we don't have saved.notebook here
      modified: last.notebook !== current.notebook,
      notebook: current.notebook
    }))
    .pluck("modified");

  const fullpath$ = state$.map(
    state => state.metadata.get("filename") || "Untitled"
  );

  const executionState$ = state$
    .map(state => state.app.get("executionState"))
    .debounceTime(200);

  return Observable.combineLatest(
    modified$,
    fullpath$,
    executionState$,
    (modified, fullpath, executionState) => ({
      modified,
      fullpath,
      executionState
    })
  )
    .distinctUntilChanged()
    .switchMap(i => Observable.of(i));
}

export function initNativeHandlers(store) {
  const state$ = Observable.from(store);

  return createTitleFeed(state$).subscribe(setTitleFromAttributes, err =>
    console.error(err)
  );
}
