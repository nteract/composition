import * as fs from "fs";

export const filesystem = fs;
const mkdirp = require("mkdirp");

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/bindNodeCallback";

export const unlinkObservable = path =>
  Observable.create(observer => {
    if (filesystem.existsSync(path)) {
      filesystem.unlink(path, error => {
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
  filesystem.symlink
);

export const createSymlinkObservable = (target, path) =>
  unlinkObservable(path).flatMap(() =>
    createNewSymlinkObservable(target, path)
  );

export const readFileObservable = Observable.bindNodeCallback(
  filesystem.readFile
);

export const writeFileObservable = Observable.bindNodeCallback(
  filesystem.writeFile
);

export const mkdirpObservable = Observable.bindNodeCallback(mkdirp);
