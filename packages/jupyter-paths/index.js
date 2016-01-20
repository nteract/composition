/**
 * @module ipython-paths
 *
 * @description Module `ipython-paths` provides path helpers for IPython 3.x
 */

const path = require('path');
const fs = require('fs');
const async = require('async');

const home = require('home-dir');

/**
 * expectedDataDirs returns all the expected static directories for this OS.
 * The user of this function should make sure to make sure the directories
 * exist.
 *
 * At this time, we don't include {sys.prefix}/share/jupyter
 * When we do, we can assume that withSysPrefix is passed
 *
 * @return {Array} All the Jupyter Data Dirs
 */
function expectedDataDirs() {
  var paths = [];
  if (process.env.JUPYTER_PATH) {
    paths.push(process.env.JUPYTER_PATH);
  }

  paths.push(userDataDir());

  // System wide for Windows and Unix
  if (process.platform === 'win32') {
    paths.push(path.resolve(
      path.join(process.env('PROGRAMDATA'), 'jupyter')));
  }
  else {
    paths.push('/usr/share/jupyter/');
    paths.push('/usr/local/share/jupyter/');
  }

  return paths;
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

function validDirectory(p, cb) {
  fs.stat(p, (err, stat) => {
    // explicitly ignoring err, file doesn't exist or can't be reached
    if(err) {
      return cb(false);
    }
    return cb(stat.isDirectory());
  });
}

function filteredValidDirectories(dirs) {
  return new Promise((resolve, reject) => {
    async.filter(dirs, validDirectory, (results) => {
      resolve(results);
    });
  });
}

function dataDirs() {
  return filteredValidDirectories(expectedDataDirs());
}

function kernelDirs() {
  return filteredValidDirectories(
           expectedDataDirs().map((dir) => {
             return path.join(dir, 'kernels');
           })
         )
}

function expectedRuntimeDir() {
  if(process.env.JUPYTER_RUNTIME_DIR) {
      return JUPYTER_RUNTIME_DIR
  }

  if(process.env.XDG_RUNTIME_DIR) {
    return path.join(process.env.XDG_RUNTIME_DIR, 'jupyter');
  }
  return path.join(userDataDir(), 'runtime');
}

function runtimeDir() {
  const p = expectedRuntimeDir();
  return new Promise((resolve, reject) => {
    fs.stat(p, (err, stat) => {
      // explicitly ignoring err, file doesn't exist or can't be reached
      if(err) {
        reject(err);
      }
      if(stat.isDirectory()) {
        resolve(p);
      }
      reject(new Error(`${p} is not a directory`))
    });
  })
}

module.exports = {
  expectedRuntimeDir,
  expectedDataDirs,
  userDataDir,
  dataDirs,
  kernelDirs,
  runtimeDir,
};
