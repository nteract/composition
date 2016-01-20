const jp = require('../')

const expect = require('chai').expect

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

describe('runtimeDir', () => {
  it('returns a string for a path that contains runtime files', () => {
    return jp.runtimeDir()
             .then((dir) => {
              expect(dir).to.be.a('String')
             })
  })
})
