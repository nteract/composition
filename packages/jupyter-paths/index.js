/**
 * @module jupyter-paths
 *
 * @description Module `jupyter-paths` provides path helpers for IPython 4.x
 */

const fs = require('fs');
const path = require('path');
const home = require('home-dir');
const sysPrefixPromise = require('sys-prefix-promise');

var sysPrefixGuess = undefined;

function accessCheck(d) {
  // check if a directory exists and is listable (X_OK)
  if (!fs.existsSync(d)) return false;
  try {
    fs.accessSync(d, fs.X_OK);
  } catch (e) {
    // [WSA]EACCES
    return false;
  }
  return true;
}

function guessSysPrefix() {
  // inexpensive guess for sysPrefix based on location of `which python`
  // based on shutil.which from Python 3.5

  // only run once:
  if (sysPrefixGuess !== undefined) return sysPrefixGuess;

  var PATH = (process.env.PATH || '').split(path.delimiter);
  if (PATH.length === 0) {
    sysPrefixGuess = null;
    return;
  }

  var pathext = [''];
  if (process.platform === 'win32') {
    pathext = (process.env.PATHEXT || '').split(path.delimiter);
  }

  PATH.some(bin => {
    bin = path.resolve(bin);
    var python = path.join(bin, 'python');

    return pathext.some(ext => {
      var exe = python + ext;
      if (accessCheck(exe)) {
        // PREFIX/bin/python exists, return PREFIX
        // following symlinks
        if (process.platform === 'win32') {
          // Windows: Prefix\Python.exe
          sysPrefixGuess = path.dirname(fs.realpathSync(exe));
        } else {
          // Everywhere else: prefix/bin/python
          sysPrefixGuess = path.dirname(path.dirname(fs.realpathSync(exe)));
        }
        return true;
      }
    })
  })
  if (sysPrefixGuess === undefined) {
    // store null as nothing found, but don't run again
    sysPrefixGuess = null;
  }
  return sysPrefixGuess;
}


function systemConfigDirs() {
  var paths = [];
  // System wide for Windows and Unix
  if (process.platform === 'win32') {
    paths.push(path.resolve(
      path.join(process.env.PROGRAMDATA, 'jupyter')));
  } else {
    paths.push('/usr/local/etc/jupyter');
    paths.push('/etc/jupyter');
  }
  return paths;
}

function configDirs(opts) {
  var paths = [];
  if (process.env.JUPYTER_CONFIG_DIR) {
    paths.push(process.env.JUPYTER_CONFIG_DIR);
  }

  paths.push(home('.jupyter'));
  const systemDirs = systemConfigDirs();

  if (opts && opts.withSysPrefix) {
    return sysPrefixPromise()
            .then(sysPrefix => path.join(sysPrefix, 'etc', 'jupyter'))
            .then(sysPathed => {
              if (systemDirs.indexOf(sysPathed) === -1) {
                paths.push(sysPathed);
              }
              return paths.concat(systemDirs);
            });
  }
  // inexpensive guess, based on location of `jupyter` executable
  var sysPrefix = guessSysPrefix();
  var sysPathed = path.join(sysPrefix, 'etc', 'jupyter');
  if (systemDirs.indexOf(sysPathed) === -1) {
    paths.push(sysPathed);
  }
  return paths.concat(systemDirs);
}

function systemDataDirs() {
  var paths = [];
  // System wide for Windows and Unix
  if (process.platform === 'win32') {
    paths.push(path.resolve(
      path.join(process.env.PROGRAMDATA, 'jupyter')));
  } else {
    paths.push('/usr/local/share/jupyter');
    paths.push('/usr/share/jupyter');
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
  if (process.platform === 'darwin') {
    return home('Library/Jupyter');
  } else if (process.platform === 'win32') {
    return path.resolve(path.join(process.env.APPDATA, 'jupyter'));
  }
  // TODO: respect XDG_DATA_HOME
  return home('.local/share/jupyter');
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
function dataDirs(opts) {
  var paths = [];
  if (process.env.JUPYTER_PATH) {
    paths.push(process.env.JUPYTER_PATH);
  }

  paths.push(userDataDir());

  const systemDirs = systemDataDirs();

  if (opts && opts.withSysPrefix) {
    return sysPrefixPromise()
            .then(sysPrefix => path.join(sysPrefix, 'share', 'jupyter'))
            .then(sysPathed => {
              if (systemDirs.indexOf(sysPathed) === -1) {
                paths.push(sysPathed);
              }
              return paths.concat(systemDataDirs());
            });
  }
  // inexpensive guess, based on location of `jupyter` executable
  var sysPrefix = guessSysPrefix();
  var sysPathed = path.join(sysPrefix, 'share', 'jupyter');
  if (systemDirs.indexOf(sysPathed) === -1) {
    paths.push(sysPathed);
  }
  return paths.concat(systemDirs);
}

function runtimeDir() {
  if (process.env.JUPYTER_RUNTIME_DIR) {
    return process.env.JUPYTER_RUNTIME_DIR;
  }

  if (process.env.XDG_RUNTIME_DIR) {
    return path.join(process.env.XDG_RUNTIME_DIR, 'jupyter');
  }
  return path.join(userDataDir(), 'runtime');
}

module.exports = {
  dataDirs,
  runtimeDir,
  configDirs,
};
