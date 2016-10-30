const jp = require('../')

const expect = require('chai').expect

const path = require('path')
const home = require('home-dir')

const execSync = require('child_process').execSync

const actual = JSON.parse(execSync('jupyter --paths --json'))

// case-insensitive comparisons
actual.data = actual.data.map(path => { return path.toLowerCase(); });
actual.config = actual.config.map(path => { return path.toLowerCase(); });

describe('dataDirs', () => {
  it('returns a promise that resolves to a list of directories that exist', () => {
    return jp.dataDirs({withSysPrefix: true})
             .then((dirs) => {
               dirs = dirs.map(dir => { return dir.toLowerCase() });
               expect(dirs).to.be.an('Array')
               dirs.forEach(el => {
                 expect(el).to.be.a('String')
               })
               expect(dirs).to.deep.equal(actual.data)
             })
  })
  it('returns a promise that resolves to a list of directories that exist', () => {
    return jp.dataDirs({askJupyter: true})
             .then((dirs) => {
               dirs = dirs.map(dir => { return dir.toLowerCase() });
               expect(dirs).to.be.an('Array')
               dirs.forEach(el => {
                 expect(el).to.be.a('String')
               })
               expect(dirs).to.deep.equal(actual.data)
             })
  })
  it('returns immediately with a guess when withSysPrefix is false', () => {
    var dirs = jp.dataDirs({withSysPrefix: false});
    dirs = dirs.map(dir => { return dir.toLowerCase() });
    expect(dirs).to.be.an('Array');
    dirs.forEach(el => {
      expect(el).to.be.a('String')
    });
    expect(dirs).to.deep.equal(actual.data);
  })
})

describe('runtimeDir', () => {
  it('returns the directory where runtime data is stored', () => {
    expect(jp.runtimeDir()).to.equal(actual.runtime[0])
  })
})

describe('configDirs', () => {
  it('returns a promise that resolves to a list of directories that exist', () => {
    return jp.configDirs({withSysPrefix: true})
             .then((dirs) => {
               dirs = dirs.map(dir => { return dir.toLowerCase() });
               expect(dirs).to.be.an('Array')
               dirs.forEach(el => {
                 expect(el).to.be.a('String')
               })
               expect(dirs).to.deep.equal(actual.config)
             })
  })
  it('returns a promise that resolves to a list of directories that exist', () => {
    return jp.configDirs({askJupyter: true})
             .then((dirs) => {
               dirs = dirs.map(dir => { return dir.toLowerCase() });
               expect(dirs).to.be.an('Array')
               dirs.forEach(el => {
                 expect(el).to.be.a('String')
               })
               expect(dirs).to.deep.equal(actual.config)
             })
  })
  it('returns immediately with a guess when withSysPrefix is false', () => {
    var dirs = jp.configDirs({withSysPrefix: false});
    dirs = dirs.map(dir => { return dir.toLowerCase() });
    expect(dirs).to.be.an('Array');
    dirs.forEach(el => {
      expect(el).to.be.a('String')
    });
    expect(dirs).to.deep.equal(actual.config);
  })
})

