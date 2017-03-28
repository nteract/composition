import Rx from "rxjs/Rx";
import * as fs from "fs";

export const filesystem = fs;
const mkdirp = require("mkdirp");

export const unlinkObservable = path =>
  Rx.Observable.create(observer => {
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

export const createNewSymlinkObservable = Rx.Observable.bindNodeCallback(
  filesystem.symlink
);

export const createSymlinkObservable = (target, path) =>
  unlinkObservable(path).flatMap(() =>
    createNewSymlinkObservable(target, path));

export const readFileObservable = Rx.Observable.bindNodeCallback(
  filesystem.readFile
);

export const writeFileObservable = Rx.Observable.bindNodeCallback(
  filesystem.writeFile
);

export const mkdirpObservable = Rx.Observable.bindNodeCallback(mkdirp);
