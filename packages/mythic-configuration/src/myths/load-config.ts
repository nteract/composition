import { readFileObservable } from "fs-observable";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { configuration } from "../package";
import { mergeConfig } from "./merge-config";

export const loadConfig = configuration.createMyth("loadConfig")<void>({
  thenDispatch: [
    (_, state) =>
      state.backend!.load(),
  ],
});
