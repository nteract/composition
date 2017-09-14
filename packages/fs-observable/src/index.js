// @flow
import * as fs from "fs";

const mkdirp = require("mkdirp");

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/bindNodeCallback";
import "rxjs/add/operator/mergeMap";

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

export const createNewSymlinkObservable = Observable.bindNodeCallback(
  fs.symlink
);

export const createSymlinkObservable = (target: string, path: string) =>
  unlinkObservable(path).mergeMap(() =>
    createNewSymlinkObservable(target, path)
  );

export const readFileObservable = Observable.bindNodeCallback(fs.readFile);

export const writeFileObservable = Observable.bindNodeCallback(fs.writeFile);

export const mkdirpObservable = Observable.bindNodeCallback(mkdirp);
