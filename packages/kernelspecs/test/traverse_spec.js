const findAll = require('../').findAll;

const expect = require('chai').expect;

describe('findAll', () => {
  it('retrieves a collection of kernel specs', () => {
    return findAll().then(kernelspecs => {
      expect(kernelspecs).to.have.any.keys('python3', 'python2');

      const defaultKernel = kernelspecs.python2 || kernelspecs.python3;

      expect(defaultKernel).to.have.property('spec');
      expect(defaultKernel).to.have.property('resources_dir');

      const spec = defaultKernel.spec;

      expect(spec).to.have.property('display_name');
      expect(spec).to.have.property('argv');

    });
  });
});
