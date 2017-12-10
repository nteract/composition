module.exports = {
  launchSpec: kernelSpec => {
    function writeConnectionFile(config) {
      return new Promise((resolve, reject) => {
        try {
          resolve({ config, connectionFile: "connectionFile" });
        } catch (err) {
          reject(err);
        }
      });
    }
    return writeConnectionFile("config").then(c => {
      return {
        spawn: { on: () => {} },
        connectionFile: c.connectionFile,
        config: c.config,
        kernelSpec: kernelSpec.name
      };
    });
  },
  launch: kernelSpecName => {
    function writeConnectionFile(config) {
      return new Promise((resolve, reject) => {
        try {
          resolve({ config, connectionFile: "connectionFile" });
        } catch (err) {
          reject(err);
        }
      });
    }
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
