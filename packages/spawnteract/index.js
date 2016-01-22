/* eslint camelcase: 0 */
// ^--- #justjupyterthings

const path = require('path');

const kernelspecs = require('kernelspecs');
const jp = require('jupyter-paths');

const uuid = require('uuid');
const getPorts = require('portfinder').getPorts;
const jsonfile = require('jsonfile');

function createConnectionConfig(ports) {
  return {
    version: 5,
    key: uuid.v4(),
    signature_scheme: 'hmac-sha256',
    transport: 'tcp',
    ip: '127.0.0.1',
    hb_port: ports[0],
    control_port: ports[1],
    shell_port: ports[2],
    stdin_port: ports[3],
    iopub_port: ports[4],
  };
}

function writeConnectionFile(opts) {
  if (!opts) {
    opts = {};
  }
  opts.port = opts.port || 9000;
  opts.host = opts.host || '127.0.0.1';

  return new Promise((resolve, reject) => {
    getPorts(5, opts, (err, ports) => {
      if(err) {
        reject(err);
        return;
      }
      const config = createConnectionConfig(ports);
      const configFile = path.join(jp.runtimeDir(), `kernel-${uuid.v4()}.json`);
      jsonfile.writeFile(configFile, config, (jsonErr) => {
        if(jsonErr) {
          reject(jsonErr);
          return;
        }
        resolve({
          config,
          configFile,
        });
      });
    });
  });

}

/*
function launchSpec(spec) {
  return spec.argv;
}

function launch(kernelName, specs) {
  if(!specs) {
    return kernelspecs.asPromise()
                      .then((sp) => launch(kernelName, sp));
  }

  return new Promise((resolve, reject) => {
      if(!specs[kernelName]) {
        reject(new Error(`No spec available for ${kernelName}`));
      }
      const spec = specs[kernelName].spec
      resolve(launchSpec(spec))
  })
}
*/

module.exports = {
  // launch,
  // launchSpec,
  writeConnectionFile,
};
