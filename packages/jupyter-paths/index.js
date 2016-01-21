/**
 * @module ipython-paths
 *
 * @description Module `ipython-paths` provides path helpers for IPython 3.x
 */

const path = require('path');
const fs = require('fs');
const async = require('async');

const home = require('home-dir');

const sysPrefixPromise = require('sys-prefix-promise')

function systemConfigDirs() {
  var paths = [];
  // System wide for Windows and Unix
  if (process.platform === 'win32') {
    paths.push(path.resolve(
      path.join(process.env('PROGRAMDATA'), 'jupyter')));
  }
  else {
    paths.push('/usr/local/etc/jupyter');
    paths.push('/etc/jupyter');
  }
  return paths;
}

function configDirs(withSysPrefix) {
  var paths = [];
  if (process.env.JUPYTER_CONFIG_DIR) {
    paths.push(process.env.JUPYTER_CONFIG_DIR);
  }

  paths.push(home('.jupyter'));

  if(withSysPrefix) {
    return sysPrefixPromise()
            .then(sysPrefix => path.join(sysPrefix, 'etc', 'jupyter'))
            .then(sysPathed => {
              paths.push(sysPathed)
              return paths.concat(systemConfigDirs())
            })
  }
  else {
    return paths.concat(systemConfigDirs())
  }
}

function systemDataDirs() {
  var paths = [];
  // System wide for Windows and Unix
  if (process.platform === 'win32') {
    paths.push(path.resolve(
      path.join(process.env('PROGRAMDATA'), 'jupyter')));
  }
  else {
    paths.push('/usr/share/jupyter');
    paths.push('/usr/local/share/jupyter');
  }
  return paths;
}

/**
 * dataDirs returns all the expected static directories for this OS.
 * The user of this function should make sure to make sure the directories
 * exist.
 *
 * When withSysPrefix is set, this returns a promise of directories
 *
 * @param  {bool} withSysPrefix include the sys.prefix paths
 * @return {Array} All the Jupyter Data Dirs
 */
function dataDirs(withSysPrefix) {
  var paths = [];
  if (process.env.JUPYTER_PATH) {
    paths.push(process.env.JUPYTER_PATH);
  }

  paths.push(userDataDir());

  if(withSysPrefix) {
    return sysPrefixPromise()
            .then(sysPrefix => path.join(sysPrefix, 'share', 'jupyter'))
            .then(sysPathed => {
              paths.push(sysPathed)
              return paths.concat(systemDataDirs())
            })
  }
  else {
    return paths.concat(systemDataDirs())
  }
}

/**
 * where the userland data directory resides
 * includes things like the runtime files
 * @return {string} directory for data
 */
function userDataDir() {
  // Userland specific
  if(process.platform === 'darwin') {
    return home('Library/Jupyter');
  }
  else if (process.platform === 'win32') {
    return path.resolve(path.join(process.env('APPDATA'), 'jupyter'));
  }
  else {
    // TODO: respect XDG_DATA_HOME
    return home('.local/share/jupyter')
  }
}

function runtimeDir() {
  if(process.env.JUPYTER_RUNTIME_DIR) {
      return JUPYTER_RUNTIME_DIR
  }

  if(process.env.XDG_RUNTIME_DIR) {
    return path.join(process.env.XDG_RUNTIME_DIR, 'jupyter');
  }
  return path.join(userDataDir(), 'runtime');
}

module.exports = {
  dataDirs,
  runtimeDir,
  configDirs,
};
