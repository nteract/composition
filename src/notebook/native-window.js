import { remote } from 'electron';

import path from 'path';

import Rx from 'rxjs/Rx';

const HOME = remote.app.getPath('home');

/**
 * Turn a path like /Users/n/mine.ipynb to ~/mine.ipynb
 * @param  {string} p the full path to a file
 * @return {string}   tildified path
 */
export function tildify(p) {
  if (!p) {
    return '';
  }
  const s = path.normalize(p) + path.sep;
  return (s.indexOf(HOME) === 0 ? s.replace(HOME + path.sep, `~${path.sep}`) : s).slice(0, -1);
}

export function setTitleFromAttributes(attributes) {
  const filename = tildify(attributes.fullpath);
  const { executionState } = attributes;

  const win = remote.getCurrentWindow();
  if (filename && win.setRepresentedFilename) {
    win.setRepresentedFilename(attributes.fullpath);
    win.setDocumentEdited(attributes.modified);
  }
  const title = `${filename} - ${executionState}`;
  win.setTitle(title);
}

export function createTitleFeed(state$) {
  const modified$ = state$
    .map(state => ({
      // Assume not modified to start
      modified: false,
      notebook: state.document.get('notebook'),
    }))
    .scan((last, current) => ({
      modified: last.notebook !== current.notebook,
      notebook: current.notebook,
    }))
    .pluck('modified');

  const fullpath$ = state$
    .map(state => state.metadata.get('filename') || 'Untitled');

  const executionState$ = state$
    .map(state => state.app.get('executionState'))
    .debounceTime(200);

  return Rx.Observable
    .combineLatest(
      modified$,
      fullpath$,
      executionState$,
      (modified, fullpath, executionState) => ({ modified, fullpath, executionState })
    )
    .distinctUntilChanged()
    .switchMap(i => Rx.Observable.of(i));
}

export function initNativeHandlers(store) {
  const state$ = Rx.Observable.from(store);
  return createTitleFeed(state$)
    .subscribe(setTitleFromAttributes, (err) => console.error(err));
}
