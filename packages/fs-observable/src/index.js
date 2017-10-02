// @flow
import * as fs from "fs";

const mkdirp = require("mkdirp");

import { Observable } from "rxjs/Observable";
import { bindNodeCallback } from "rxjs/observable/bindNodeCallback";
import { mergeMap } from "rxjs/operators";

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
