import chai, { expect } from 'chai';
import { unlinkObservable, createSymlinkObservable, filesystem } from '../../src/utils/fs';
const sinon = require('sinon');
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('unlinkObservable', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('it errors on unlink issue', (done) => {
    const mockError = (err) => { throw err; };
    const existsSync = sandbox.stub(filesystem, 'existsSync', (path) => true);
    const unlink = sandbox.stub(filesystem, 'unlink', (path, mockError) => mockError({ message: 'lol' }));
    const nextBuffer = [];
    const subscription = unlinkObservable('path').subscribe(
      (x) => nextBuffer.push(x),
      (err) => {
        expect(err.message).to.equal('lol');
        done();
      },
      () => expect.fail(),
    );
    expect(existsSync).to.be.calledWithMatch('path');
    expect(unlink).to.be.called;
  });
  it('completes and calls fs.existsSync, fs.unlink', (done) => {
    const existsSync = sandbox.stub(filesystem, 'existsSync');
    const unlink = sandbox.stub(filesystem, 'unlink');
    const nextBuffer = [];
    const subscription = unlinkObservable('path').subscribe(
      (x) => nextBuffer.push(x),
      (err) => expect.fail(err, null),
      () => {
        expect(nextBuffer.length).to.equal(1);
        done();
      },
    );
    expect(existsSync).to.be.calledWithMatch('path');
    expect(unlink).to.be.called;
  });
});

describe('createSymlinkObservable', () => {
  it('returns an observable', () => {
    expect(createSymlinkObservable('target', 'path').subscribe).to.not.be.null;
  });
});
