import { Map } from "immutable";

import * as actionTypes from "../src/actionTypes";
import { config as reducers } from "../src/reducers";

describe("setKey", () => {
  test("sets the keys in the config", () => {
    const initialState = new Map({ theme: null });

    const state = reducers(initialState, {
      type: actionTypes.SET_CONFIG_AT_KEY,
      key: "theme",
      value: "light"
    });
    expect(state.get("theme")).toBe("light");
  });
});

describe("mergeConfig", () => {
  test("sets the config", () => {
    const initialState = new Map();

    const config = { theme: "dark" };
    const state = reducers(initialState, {
      type: actionTypes.MERGE_CONFIG,
      config
    });
    expect(state.get("theme")).toBe("dark");
  });
});
