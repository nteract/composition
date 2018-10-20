// @flow
const isDir = require("./../backend/content-providers/s3/contents").isDir;

describe("Routes util tests", () => {
  test("returns isDir true", () => {
    expect(isDir("path/to/dir/")).toBe(true);
  });

  test("returns isDir false", () => {
    expect(isDir("path/to/dir/file.text")).toBe(false);
  });

  test("treats empty path as dir path", () => {
    expect(isDir("")).toBe(true);
    //s3 defaults to root
    expect(isDir(null)).toBe(true);
    expect(isDir(undefined)).toBe(true);
  });
});
