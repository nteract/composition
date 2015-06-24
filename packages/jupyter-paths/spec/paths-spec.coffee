path = require('path')
fs = require('fs')

# TODO: mock process.env
# TODO: mock process.platform
# TODO: Convert (back) to JavaScript?

describe "JupyterPath", ->
  # Because `paths` shells out to Python, we need a chance to mock it first
  [jupyterPath, jupyterConfigDir, jupyterDataDir, jupyterRuntimeDir] = []

  describe "when a dir is requested", ->
    it "it returns an array of path strings", ->
      jp = require '../index'

      for dirs in [jp.kernelDirs(), jp.runtimeDirs(), jp.dataDirs(), jp.configDirs()]
        expect(Array.isArray(dirs)).toBeTruthy()
        for dir in dirs
          expect(typeof(dir)).toBe('string')

          parsed = path.parse(dir)

          expect(parsed.root).toBe('/')
          expect(parsed.dir)
