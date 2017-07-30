import { expect } from "chai";

import { defaultPathFallback } from "../../src/notebook/path";

describe("defaultPathFallback", () => {
  it("returns a object with the defaultPath", () => {
    const path = defaultPathFallback("dummy-path");
    expect(path).to.deep.equal({ defaultPath: "dummy-path" });
  });
  it("returns a object with the correct path", () => {
    if (process.platform !== "win32") {
      process.chdir("/");
      const path = defaultPathFallback();
      expect(path).to.deep.equal({ defaultPath: "/home/home/on/the/range" });
    }
  });
});
