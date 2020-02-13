import { writeFileObservable } from "fs-observable";
import { EMPTY } from "rxjs";
import { mergeMapTo } from "rxjs/operators";
import { configuration } from "../package";

export const saveConfig = configuration.createMyth("saveConfig")<void>({
  thenDispatch: [
    (_, state) =>
      writeFileObservable(
        state.filename!,
        JSON.stringify(state.current.toJSON()),
      ).pipe(mergeMapTo(EMPTY)),
  ],
});
