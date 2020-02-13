import { readFileObservable } from "fs-observable";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { configuration } from "../package";
import { mergeConfig } from "./merge-config";

export const loadConfig = configuration.createMyth("loadConfig")<string>({
  reduce: (state, action) =>
    state.set("filename", action.payload),

  thenDispatch: [
    (_, state) =>
      readFileObservable(state.filename!).pipe(
        map(data => JSON.parse(data.toString())),
      ).pipe(map(mergeConfig.create)),
  ],
});
