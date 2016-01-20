const jp = require('../')

const expect = require('chai').expect

const path = require('path')
const home = require('home-dir')

describe('dataDirs', () => {
  it('returns a promise that resolves to a list of directories that exist', () => {
    return jp.dataDirs()
             .then((dirs) => {
               expect(dirs).to.be.an('Array')
               dirs.forEach(el => {
                 expect(el).to.be.a('String')
               })
             })
  })
})

describe('kernelDirs', () => {
  it('returns a promise that resolves to a list of directories that exist', () => {
    return jp.kernelDirs()
             .then((dirs) => {
               expect(dirs).to.be.an('Array')
               dirs.forEach(el => {
                 expect(el).to.be.a('String')
               })
             })
  })
})

describe('expectedRuntimeDir', () => {
  it('returns the path to the specced runtime directory', () => {
    const dir = jp.expectedRuntimeDir()
    expect(dir).to.equal(path.join(jp.userDataDir(), 'runtime'))
  })
})
