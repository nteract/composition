import { configuration } from "../package";

export const loadConfig = configuration.createMyth("loadConfig")<void>({
  thenDispatch: [
    (_, state) =>
      state.backend!.load(),
  ],
});
