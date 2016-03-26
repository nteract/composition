/**
 * This module contains methods that allow you to spawn Jupyter kernels.  You
 * can spawn kernels either by name or by a kernelSpec object (see the
 * `kernelspecs` npm package for more information).
 *
 * Usage example:
 * ```js
 * var spawnResults = require('spawnteract').launch('python3');
 *
 * // Print the ip address and port for the shell channel
 * console.log(spawnResults.config.ip + ':' + spawnResults.config.shell_port);
 * ```
 *
 * You'll need to close `spawnResults.spawn` yourself as well as delete
 * `spawnResults.connectionFile` from disk when finished.
 *
 * @exports spawnteract
 */

/* eslint camelcase: 0 */
// ^--- #justjupyterthings
/**
 *
 */
const path = require('path');

const kernelspecs = require('kernelspecs');
const jp = require('jupyter-paths');

const uuid = require('uuid');
const getPorts = require('portfinder').getPorts;
const jsonfile = require('jsonfile');

const child_process = require('child_process');
const mkdirp = require('mkdirp');

/**
 * Creates a connectionConfig object given an array of ports
 * @private
 * @param  {number[]} ports array of ports to use for the connection, [hb_port,
 *                          control_port, shell_port, stdin_port, iopub_port]
 * @return {object}         connectionConfig object
 */
function _createConnectionConfig(ports) {
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

/**
 * Write a connection file
 * @public
 * @param  {object} [options]                     connection options
 * @param  {number} [options.port]
 * @param  {string} [options.host]
 * @return {object} configResults
 * @return {object} configResults.config          connectionConfig
 * @return {string} configResults.connectionFile  path to the config file
 */
function writeConnectionFile(portFinderOptions) {
  const options = Object.assign({}, portFinderOptions);
  options.port = options.port || 9000;
  options.host = options.host || '127.0.0.1';

  return new Promise((resolve, reject) => {
    getPorts(5, options, (err, ports) => {
      if (err) {
        reject(err);
      } else {
        // Make sure the kernel runtime dir exists before trying to write the
        // kernel file.
        const runtimeDir = jp.runtimeDir();
        mkdirp(runtimeDir);

        // Write the kernel connection file.
        const config = _createConnectionConfig(ports);
        const connectionFile = path.join(jp.runtimeDir(), `kernel-${uuid.v4()}.json`);
        jsonfile.writeFile(connectionFile, config, (jsonErr) => {
          if (jsonErr) {
            reject(jsonErr);
          } else {
            resolve({
              config,
              connectionFile,
            });
          }
        });
      }
    });
  });
}

/**
 * Launch a kernel for a given kernelSpec
 * @public
 * @param  {object}       kernelSpec      describes a specific
 *                                        kernel, see the npm
 *                                        package `kernelspecs`
 * @param  {object}       [options]       connection options
 * @param  {number}       [options.port]
 * @param  {string}       [options.host]
 * @param  {object}       [spawnOptions]  options for [child_process.spawn]{@link https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options}
 * @return {object}       spawnResults
 * @return {ChildProcess} spawnResults.spawn           spawned process
 * @return {string}       spawnResults.connectionFile  connection file path
 * @return {object}       spawnResults.config          connectionConfig
 *
 */
function launchSpec(kernelSpec, options, spawnOptions) {
  return writeConnectionFile(options).then((c) => {
    const connectionFile = c.connectionFile;
    const config = c.config;
    const argv = kernelSpec.argv.map(x => x === '{connection_file}' ? connectionFile : x);
    const runningKernel = child_process.spawn(argv[0], argv.slice(1), spawnOptions);
    return {
      spawn: runningKernel,
      connectionFile,
      config,
    };
  });
}

/**
 * Launch a kernel by name
 * @public
 * @param  {string}       kernelName
 * @param  {object[]}     [specs]                      array of kernelSpec
 *                                                     objects to look through.
 *                                                     See the npm package
 *                                                     `kernelspecs`
 * @param  {object}       [spawnOptions]  options for [child_process.spawn]{@link https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options}
 * @return {object}       spawnResults
 * @return {ChildProcess} spawnResults.spawn           spawned process
 * @return {string}       spawnResults.connectionFile  connection file path
 * @return {object}       spawnResults.config          connectionConfig
 */
function launch(kernelName, specs, spawnOptions) {
  // Let them pass in a cached specs file
  if (!specs) {
    return kernelspecs.findAll()
                      .then((sp) => launch(kernelName, sp, spawnOptions));
  }
  if (!specs[kernelName]) {
    return Promise.reject(new Error(`No spec available for ${kernelName}`));
  }
  const spec = specs[kernelName].spec;
  return launchSpec(spec, spawnOptions);
}

module.exports = {
  launch,
  launchSpec,
  writeConnectionFile,
};
