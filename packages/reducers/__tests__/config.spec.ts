import { Map } from "immutable";

import * as actionTypes from "@nteract/actions";
import reducers from "../src/config";

describe("SetConfig", () => {
  test("sets the keys in the config", () => {
    const initialState = Map({ theme: null });
    const config = { theme: "light" };
    const state = reducers(initialState, {
      type: actionTypes.SET_CONFIG,
      payload: config
    });
    expect(state.get("theme")).toBe("light");
  });
  test("sets the config on config loaded action", () => {
    const initialState = Map({ autoSaveInterval: 20000 });
    const action = actionTypes.configLoaded({
      autoSaveInterval: 0
    });
    const state = reducers(initialState, action);
    expect(state.get("autoSaveInterval")).toBe(0);
  });
});
