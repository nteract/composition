import { writeFileObservable } from "fs-observable";
import { configuration } from "../package";

export const saveConfig = configuration.createMyth("saveConfig")<void>({
  epics: [
    {
      onAction: "self",
      dispatch: null,
      from: ([_, state]) =>
        writeFileObservable(
          state.filename!,
          JSON.stringify(state.current.toJS())
        ),
      switchToMostRecent: true
    }
  ]
});
