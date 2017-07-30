import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import {
  unlinkObservable,
  createSymlinkObservable,
  filesystem
} from "../../src/utils/fs";

import "rxjs/add/operator/toArray";

const sinon = require("sinon");

chai.use(sinonChai);

describe("unlinkObservable", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });
  it("it errors on unlink issue", done => {
    const existsSync = sandbox.stub(filesystem, "existsSync", () => true);
    const unlink = sandbox.stub(filesystem, "unlink", (path, error) =>
      error({ message: "lol" })
    );
    unlinkObservable("path").subscribe(
      _ => _,
      err => {
        expect(err.message).to.equal("lol");
        done();
      },
      () => expect.fail()
    );
    expect(existsSync).to.be.calledWithMatch("path");
    expect(unlink).to.be.called;
  });
  it("completes and calls fs.existsSync, fs.unlink", done => {
    const existsSync = sandbox.stub(filesystem, "existsSync");
    const unlink = sandbox.stub(filesystem, "unlink");
    unlinkObservable("path")
      .toArray()
      .subscribe(
        nexts => expect(nexts.length).to.equal(1),
        err => expect.fail(err, null),
        () => done()
      );
    expect(existsSync).to.be.calledWithMatch("path");
    expect(unlink).to.be.called;
  });
});

describe("createSymlinkObservable", () => {
  it("returns an observable", () => {
    expect(createSymlinkObservable("target", "path").subscribe).to.not.be.null;
  });
});
