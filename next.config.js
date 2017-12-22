const fs = require("fs");
const path = require("path");

const packageDirs = fs
  .readdirSync("packages")
  .filter(f => fs.statSync(path.join("packages", f)).isDirectory())
  .map(dir => path.resolve(__dirname, "packages", dir, "node_modules"));

module.exports = {
  webpack: (config, { buildId, dev }) => {
    console.log(config);
    console.log("*****");
    console.log("old resolve", config.resolve);
    config.resolve = Object.assign({}, config.resolve, {
      modules: config.resolve.modules.concat(packageDirs)
    });

    console.log("new resolve", config.resolve);
    return config;
  }
};
