import { of } from "rxjs";
import { configuration } from "../package";
import { saveConfig } from "./save-config";

export const setConfigAtKey = configuration.createMyth("setConfigAtKey")<{
  key: string;
  value: any;
}>({
  reduce: (state, action) =>
    state.setIn(["current", action.payload.key], action.payload.value),

  thenDispatch: [
    () => of(saveConfig.create()),
  ],
});
