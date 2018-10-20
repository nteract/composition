import { unlinkObservable, readdirObservable } from "../src";

jest.mock("fs");
const fs = require("fs");

describe("unlinkObservable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("errors on unlink issue", async function(done) {
    expect.assertions(3);
    // File exists so we try to unlink it
    fs.existsSync.mockImplementation(() => true);
    // Unlink fails for some reason (permissions, etc.)
    fs.unlink.mockImplementation((path, callback) =>
      callback({ message: "forced failure" })
    );
    try {
      await unlinkObservable("path").toPromise();
      // Should not pass through
      done.fail();
    } catch (err) {
      expect(err.message).toBe("forced failure");
    }
    expect(fs.existsSync).toBeCalledWith("path");
    expect(fs.unlink).toBeCalled();
    done();
  });
  it("completes and calls fs.existsSync, fs.unlink", async function() {
    expect.assertions(2);
    fs.existsSync.mockImplementation(() => true);
    fs.unlink.mockImplementation((path, callback) => callback());

    await unlinkObservable("path2").toPromise();

    expect(fs.existsSync).toBeCalledWith("path2");
    expect(fs.unlink).toBeCalled();
  });
});

describe("readdirObservable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("lists a directory with ✨  Observables ✨", async function() {
    expect.assertions(2);
    fs.readdir.mockImplementation((path, callback) => {
      callback(null, ["fantastic.ipynb", "README.md"]);
    });

    const listing = await readdirObservable("/some/where").toPromise();
    expect(listing).toEqual(["fantastic.ipynb", "README.md"]);

    expect(fs.readdir).toHaveBeenCalledWith(
      "/some/where",
      expect.any(Function)
    );
  });
  it("handles errors listing directories, passes it back directly", async function(done) {
    expect.assertions(2);
    fs.readdir.mockImplementation((path, callback) => {
      callback(new Error("you can't look there"));
    });

    try {
      await readdirObservable("/invalid").toPromise();
      done.fail();
    } catch (error) {
      expect(error).toEqual(new Error("you can't look there"));
    }

    expect(fs.readdir).toHaveBeenCalledWith("/invalid", expect.any(Function));

    done();
  });
});
