const expect = require("chai").expect;
const fs = require("fs");

const launch = require("../").launch;
const kernelspecs = require("kernelspecs");

describe("launch", () => {
  it("spawns a kernel", () => {
    return kernelspecs
      .findAll()
      .then(kernels => {
        const kernel = kernels.python2 || kernels.python3;
        return launch(kernel.name);
      })
      .then(c => {
        expect(c).to.not.be.null;
        expect(c.spawn).to.not.be.null;

        c.spawn.kill();
        fs.unlinkSync(c.connectionFile);
      });
  });
});
