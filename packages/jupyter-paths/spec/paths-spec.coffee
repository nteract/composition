path = require('path')

# TODO: mock process.env
# TODO: mock process.platform
# TODO: Convert (back) to JavaScript?

describe "JupyterPath", ->
  # Because `paths` shells out to Python, we need a chance to mock it first
  [jupyterPath, jupyterConfigDir, jupyterDataDir, jupyterRuntimeDir] = []

  beforeEach ->
    # Do the require directly at least
    {jupyterPath, jupyterConfigDir,
     jupyterDataDir, jupyterRuntimeDir, userHome} = require '../index'

  describe "when jupyterPath is called", ->
    it "it returns an array of path strings", ->
      kernelspecs = jupyterPath()
      expect(Array.isArray(kernelspecs)).toBeTruthy()

      for kernelspec in kernelspecs
        expect(typeof(kernelspec)).toBe('string')

        parsed = path.parse(kernelspec)

        expect(parsed.root).toBe('/')
        expect(parsed.dir)

  describe "when jupyterPath is called with kernels", ->
    it "has 'kernels' at the end of each path", ->
      kernelspecs = jupyterPath('kernels')
      for kernelspec in kernelspecs
        parsed = path.parse(kernelspec)
        expect(parsed.base).toBe('kernels')

describe "JupyterPath mocked", ->
  beforeEach ->
      # process.platform is not writeable but it can be overridden with
      # defineProperty
      Object.defineProperty(process, 'platform', {
        value: 'darwin'
      })
    
  describe "when on OS X", ->
    it "has OS X specific system directories", ->
      spyOn(process, 'platform')
      process.platform = 'darwin'

      {jupyterDataDir} = require '../index'

      expect(jupyterDataDir()).toContain("/Library/Jupyter")

describe "Windows Path testing", ->

  beforeEach ->
      # process.platform is not writeable but it can be overridden with
      # defineProperty
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      })

      path.sep = path.win32.sep
      Object.defineProperty(path, 'sep', {
        value: "\\"
      })

      path.separator = path.win32.separator
      Object.defineProperty(path, 'separator', {
        value: "\\"
      })


  describe "when on Windows", ->
    it "respects APPDATA", ->
      process.env['APPDATA'] = "C:\\USERS\\Jovyan\\AppData"

      {jupyterPath, jupyterConfigDir,
       jupyterDataDir, jupyterRuntimeDir, userHome} = require '../index'

      expect(jupyterDataDir()).toContain("C:\\USERS\\Jovyan\\AppData")
