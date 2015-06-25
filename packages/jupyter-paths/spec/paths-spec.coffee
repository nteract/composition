# TODO: Convert (back) to JavaScript?

path = require('path')

describe "JupyterPath", ->
  describe "when a dir is requested", ->
    it "it returns an array of path strings", ->
      jp = require('../index')

      for dirs in [jp.paths.kernelspecs, jp.paths.runtime, jp.paths.data, jp.paths.config]
        expect(Array.isArray(dirs)).toBeTruthy()

        for dir in dirs
          expect(typeof(dir)).toBe('string')

          parsed = path.parse(dir)

          expect(parsed.root).toBe('/')
          expect(parsed.dir)
