import chokidar from "chokidar";
import * as fs from "fs";
import mkdirp from "mkdirp";
import { bindNodeCallback, Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";

/**
 * Deletes a file, if it exists
 */
export const unlinkObservable = (path: string) =>
  new Observable(observer => {
    if (fs.existsSync(path)) {
      fs.unlink(path, error => {
        if (error) {
          observer.error(error);
        } else {
          observer.next();
          observer.complete();
        }
      });
    } else {
      observer.next();
      observer.complete();
    }
  });

export const createNewSymlinkObservable = bindNodeCallback(fs.symlink);

/**
 * Creates a symlink, overwriting any old ones in the process
 */
export const createSymlinkObservable = (target: string, path: string) =>
  unlinkObservable(path).pipe(
    mergeMap(() => createNewSymlinkObservable(target, path))
  );

export const readFileObservable = bindNodeCallback(fs.readFile);

export const writeFileObservable = bindNodeCallback(fs.writeFile);

export const mkdirpObservable = bindNodeCallback(mkdirp);

/**
 * Reads a directory, allowing for both forms of fs.readdir arguments
 */
export function readdirObservable(
  path: string,
  options?: { encoding?: string | null } | string | null
): Observable<string[] | Buffer[]> {
  return new Observable(observer => {
    const cb = (err: Error | null = null, files: string[] | Buffer[]) => {
      if (err) {
        observer.error(err);
        return;
      }
      observer.next(files);
      observer.complete();
    };

    if (options) {
      fs.readdir(path, options, cb);
      return;
    }

    fs.readdir(path, cb);
  });
}

export const statObservable: (
  path: string
) => Observable<fs.Stats> = bindNodeCallback(fs.stat);

/**
 * Watches a file for change
 */
export function watchFileObservable(
  path: string,
): Observable<{path: string, event: "add" | "change" | "unlink"}> {
  return new Observable(observer => {
    const watcher = chokidar.watch(path);
    watcher.on("error",
        err => observer.error(err));
    watcher.on("add",
        filepath => observer.next({path: filepath, event: "add"}));
    watcher.on("change",
        filepath => observer.next({path: filepath, event: "change"}));
    watcher.on("unlink",
        filepath => observer.next({path: filepath, event: "unlink"}));
  });
}
