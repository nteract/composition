import { configuration } from "../package";

export const mergeConfig = configuration.createMyth("mergeConfig")<object>({
  reduce: (state, action) =>
    state.merge(action.payload)
});
