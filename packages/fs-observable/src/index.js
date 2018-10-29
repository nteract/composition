// @flow
import * as fs from "fs";

import { Observable, bindNodeCallback } from "rxjs";
import { mergeMap } from "rxjs/operators";

const mkdirp = require("mkdirp");

export const unlinkObservable = (path: string) =>
  Observable.create(observer => {
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

export const createSymlinkObservable = (target: string, path: string) =>
  unlinkObservable(path).pipe(
    mergeMap(() => createNewSymlinkObservable(target, path))
  );

export const readFileObservable = bindNodeCallback(fs.readFile);

export const writeFileObservable = bindNodeCallback(fs.writeFile);

export const mkdirpObservable = bindNodeCallback(mkdirp);

type readdirCallback<T> = (err: ?ErrnoError, files: Array<T>) => void;

function createReaddirCallback<T>(
  observer: rxjs$Observer<Array<T>>
): readdirCallback<T> {
  return (err: ?ErrnoError, files: Array<T>) => {
    if (err) {
      observer.error(err);
    } else {
      observer.next(files);
      observer.complete();
    }
  };
}

export const readdirObservable = (
  path: string,
  options?: string | { encoding: string }
) =>
  // TODO: readdir can resolve an Array<buffer>
  // PR in progress: https://github.com/facebook/flow/pull/5820
  // We'll default to string for now
  Observable.create((observer: rxjs$Observer<Array<string>>) => {
    if (!options) {
      const callback: readdirCallback<string> = createReaddirCallback(observer);
      fs.readdir(path, callback);
    } else {
      /*
      // TODO: See above about readdir having the ability to resolve Array<buffer>
      if (options === "buffer" || options.encoding === "buffer") {
        const callback: readdirCallback<Buffer> = createReaddirCallback(
          observer
        );
        fs.readdir(path, options, callback);
        return;
      }
      */
      const callback: readdirCallback<string> = createReaddirCallback(observer);
      fs.readdir(path, options, callback);
    }
  });

export const statObservable: (
  path: string
) => Observable<fs.Stats> = bindNodeCallback(fs.stat);
