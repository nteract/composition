// @flow
const assert = require("chai").assert,
  isDir = require("./../src/content-providers/s3/contents").isDir;

describe("Routes util tests", function() {
  it("returns isDir true", function() {
    assert.isTrue(isDir("path/to/dir/"));
  });

  it("returns isDir false", function() {
    assert.isFalse(isDir("path/to/dir/file.text"));
  });

  it("treats empty path as dir path", function() {
    assert.isTrue(isDir(""));
    //s3 defaults to root
    assert.isTrue(isDir(null));
    assert.isTrue(isDir(undefined));
  });
});
