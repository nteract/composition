import { defaultPathFallback } from "../../src/notebook/path";
import { remote } from "electron";

describe("defaultPathFallback", () => {
  test("returns a object with the defaultPath", () => {
    const path = defaultPathFallback("dummy-path");
    expect(path).toEqual({ defaultPath: "dummy-path" });
  });
  test("returns a object with the correct path", () => {
    if (process.platform !== "win32") {
      process.chdir("/");
      const path = defaultPathFallback();
      expect(path).toEqual({ defaultPath: "/home/home/on/the/range" });
    }
  });
});
