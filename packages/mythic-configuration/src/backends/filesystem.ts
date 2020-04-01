import { mapErrorTo } from "@nteract/myths";
import { mkdirpObservable, readFileObservable, watchFileObservable, writeFileObservable } from "fs-observable";
import { Map } from "immutable";
import * as path from "path";
import { concat, of } from "rxjs";
import { map, mapTo, skipWhile } from "rxjs/operators";
import { ConfigurationBackend } from "..";
import { loadConfig } from "../myths/load-config";
import { mergeConfig } from "../myths/merge-config";
import { setConfigBackend } from "../myths/set-config-backend";

const filesystemConfigurationBackend = (filename: string) => ({
  setup: () =>
    concat(
      of(loadConfig.create()),
      watchFileObservable(filename).pipe(
        mapTo(loadConfig.create()),
      ),
    ),

  load: () =>
    readFileObservable(filename).pipe(
      mapErrorTo("{}", err => err.code === "ENOENT"),
      map(data => JSON.parse(data.toString())),
      // SyntaxError means the file is probably in the middle of a write
      mapErrorTo(undefined, err => err.name === "SyntaxError"),
      skipWhile(data => data === undefined),
      map(mergeConfig.create),
    ),

  save: (current: Map<string, any>) =>
    concat(
      mkdirpObservable(path.dirname(filename)),
      writeFileObservable(filename,
        JSON.stringify(current.toJSON(), undefined, 2)
      ),
    ),
} as ConfigurationBackend);

export const setConfigFile = (filename: string) =>
  setConfigBackend.create(filesystemConfigurationBackend(filename));
