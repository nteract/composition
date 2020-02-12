import { readFileObservable } from "fs-observable";
import { map } from "rxjs/operators";
import { configuration } from "../package";
import { mergeConfig } from "./merge-config";

export const loadConfig = configuration.createMyth("loadConfig")<string>({
  reduce: (state, action) =>
    state.set("filename", action.payload),

  epics: [
    {
      onAction: "self",
      dispatch: mergeConfig,
      from: ([_, state]) =>
        readFileObservable(state.filename!).pipe(
          map(data => JSON.parse(data.toString())),
        ),
      switchToMostRecent: true,
    },
  ],
});
