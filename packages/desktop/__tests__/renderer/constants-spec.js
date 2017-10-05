import * as constants from "../../src/notebook/constants";

describe("constants", () => {
  Object.keys(constants).forEach(name => {
    test(`${name} is not undefined`, () => {
      expect(constants[name]).toBeDefined();
    });
  });
});
