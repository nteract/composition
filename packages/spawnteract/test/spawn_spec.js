const expect = require('chai').expect;

const launch = require('../').launch;
const kernelspecs = require('kernelspecs');

describe('launch', () => {
  it('spawns a kernel', () => {
    return kernelspecs.findAll().then(kernels => {
      const kernel = kernels.python2 || kernels.python3;
      return launch(kernel.name);
    }).then(spawned => {
      expect(spawned).to.not.be.null;
      expect(spawned.spawn).to.not.be.null;
    });
  });
});
