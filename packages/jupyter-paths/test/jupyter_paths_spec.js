const jp = require('../')

const expect = require('chai').expect

const path = require('path')
const home = require('home-dir')

const execSync = require('child_process').execSync

const actual = JSON.parse(execSync('jupyter --paths --json'))
actual.data.sort()

describe('dataDirs', () => {
  it('returns a promise that resolves to a list of directories that exist', () => {
    return jp.dataDirs(true)
             .then((dirs) => {
               dirs.sort()
               expect(dirs).to.be.an('Array')
               dirs.forEach(el => {
                 expect(el).to.be.a('String')
               })
               expect(dirs).to.deep.equal(actual.data)
             })
  })
})

describe('kernelDirs', () => {
  it('returns a promise that resolves to a list of directories that exist', () => {
    return jp.kernelDirs(true)
             .then((dirs) => {
               dirs.sort()
               expect(dirs).to.be.an('Array')
               dirs.forEach(el => {
                 expect(el).to.be.a('String')
               })
             })
  })
})
