import { remote } from 'electron';
const { getCurrentWindow } = remote;
import home from 'home-dir';
import path from 'path';

const HOME = home();

/**
 * Turn a path like /Users/n/mine.ipynb to ~/mine.ipynb
 * @param  {string} p the full path to a file
 * @return {string}   tildified path
 */
function tildify(p) {
  if (!p) {
    return '';
  }
  const s = path.normalize(p) + path.sep;
  return (s.indexOf(HOME) === 0 ? s.replace(HOME + path.sep, `~${path.sep}`) : s).slice(0, -1);
}

export function initNativeHandlers(store) {
  store
    .map(state => {
      const { executionState, filename } = state;
      return {
        title: `${tildify(filename) || 'Untitled'} - ${executionState}`,
        path: filename,
      };
    })
    .distinctUntilChanged()
    .debounceTime(200)
    .subscribe(res => {
      const win = getCurrentWindow();
      // TODO: Investigate if setRepresentedFilename() is a no-op on non-OS X
      if (res.path && win.setRepresentedFilename) {
        // TODO: this needs to be the full path to the file
        win.setRepresentedFilename(res.path);
      }
      win.setTitle(res.title);
    });
}
