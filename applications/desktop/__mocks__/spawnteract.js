// @flow
function writeConnectionFile(config) {
  return Promise.resolve({ config, connectionFile: "connectionFile.json" });
}

module.exports = {
  launchSpec: (kernelSpec: Object): Promise<*> => {
    return writeConnectionFile("config").then(c => {
      return {
        spawn: {
          on: () => {},
          stdout: { on: () => {} },
          stderr: { on: () => {} }
        },
        connectionFile: c.connectionFile,
        config: c.config,
        kernelSpec: kernelSpec.name
      };
    });
  },
  launch: (kernelSpecName: string): Promise<*> => {
    return writeConnectionFile("config").then(c => {
      return {
        spawn: "runningKernel",
        connectionFile: c.connectionFile,
        config: c.config,
        kernelSpecName
      };
    });
  }
};
