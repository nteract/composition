import { Map } from "immutable";

import * as constants from "../../../src/notebook/constants";
import reducers from "../../../src/notebook/reducers";

describe("setKey", () => {
  test("sets the keys in the config", () => {
    const initialState = { config: new Map({ theme: null }) };

    const state = reducers(initialState, {
      type: constants.SET_CONFIG_KEY,
      key: "theme",
      value: "light"
    });
    expect(state.config.get("theme")).toBe("light");
  });
});

describe("mergeConfig", () => {
  test("sets the config", () => {
    const initialState = { config: new Map() };

    const config = { theme: "dark" };
    const state = reducers(initialState, {
      type: constants.MERGE_CONFIG,
      config
    });
    expect(state.config.get("theme")).toBe("dark");
  });
});
