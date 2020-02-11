import { remote } from "electron";
import { readFileObservable, writeFileObservable } from "fs-observable";
import * as path from "path";
import { map } from "rxjs/operators";
import { configuration } from "../package";

const HOME = remote.app.getPath("home");
const CONFIG_FILE_PATH = path.join(HOME, ".jupyter", "nteract.json");

export const mergeConfig = configuration.createMyth("mergeConfig")<object>({
  reduce: (state, action) =>
    state.merge(action.payload),
});

export const loadConfig = configuration.createMyth("loadConfig")<void>({
  epics: [
    {
      onAction: "self",
      dispatch: mergeConfig,
      from: () =>
        readFileObservable(CONFIG_FILE_PATH).pipe(
          map(data => JSON.parse(data.toString())),
        ),
      switchToMostRecent: true,
    },
  ],
});

export const saveConfig = configuration.createMyth("saveConfig")<void>({
  epics: [
    {
      onAction: "self",
      dispatch: null,
      from: (_, state$) =>
        writeFileObservable(
          CONFIG_FILE_PATH,
          JSON.stringify(state$.value.current),
        ),
      switchToMostRecent: true,
    },
  ],
});

export const setConfigAtKey = configuration.createMyth("setConfigAtKey")<{
  key: string;
  value: any;
}>({
  reduce: (state, action) =>
    state.setIn(["current", action.payload.key], action.payload.value),

  epics: [
    {
      onAction: "self",
      dispatch: saveConfig,
    },
  ],
});
