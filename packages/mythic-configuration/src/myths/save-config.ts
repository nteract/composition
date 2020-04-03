import { ignoreElements } from "rxjs/operators";
import { configuration } from "../package";

export const saveConfig = configuration.createMyth("saveConfig")<void>({
  thenDispatch: [
    (_, state) =>
      state.backend!.save(state.current),
  ],
});
