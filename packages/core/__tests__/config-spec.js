import { Map } from "immutable";

import * as constants from "../src/constants";
import { config as reducers } from "../src/reducers";

describe("setKey", () => {
  test("sets the keys in the config", () => {
    const initialState = new Map({ theme: null });

    const state = reducers(initialState, {
      type: constants.SET_CONFIG_KEY,
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
      type: constants.MERGE_CONFIG,
      config
    });
    expect(state.get("theme")).toBe("dark");
  });
});
