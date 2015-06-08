/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2015, Nicolas Riesco and others as credited in the AUTHORS file
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 */

/**
 * @module jupyter-paths
 *
 * @description Module `jupyter-paths` provides path helpers ported from github.com/jupyter/jupyter_core
 *
 *
 */

module.exports = {
  jupyterPath: jupyterPath,
  jupyterConfigDir: jupyterConfigDir,
  jupyterDataDir: jupyterDataDir,
  jupyterRuntimeDir: jupyterRuntimeDir,
  userHome: userHome
};

var fs = require('fs');
var path = require('path');

// Access `sys.prefix` from Python, to handle particular conda and virtualenv setups
// TODO: Think of something more sensible here, possibly doing this asynchronously elsewhere
// TODO: Provide a timeout, handle error
var child_process = require('child_process');
var response = child_process.spawnSync('python', ['-c', 'import sys; print(sys.prefix)']);
var sysPrefix = response.stdout.toString().replace(/^\s+|\s+$/g, "");

var SYSTEM_JUPYTER_PATH;

// Compute default system configurations
if (process.platform == 'win32') {
  programData = process.env.PROGRAMDATA;
  if (programData){
    SYSTEM_JUPYTER_PATH = [path.join(programData, 'jupyter')];
  }
  else {
    SYSTEM_JUPYTER_PATH = [path.join(sysPrefix, 'share', 'jupyter')];
  }
}
else {
  SYSTEM_JUPYTER_PATH = [
    "/usr/local/share/jupyter",
    "/usr/share/jupyter"
  ];
}

var ENV_JUPYTER_PATH = [path.join(sysPrefix, 'share', 'jupyter')];

// Returns the home specified by environment variable or
// node's built in path.resolve('~')
function userHome () {
  var homeDir = process.env.HOME || process.env.USERPROFILE || path.resolve('~');
  homeDir = fs.realpathSync(homeDir);
  return homeDir;
}

// Get the Jupyter config directory for this platform and user.
// Returns env[JUPYTER_CONFIG_DIR] if defined, else ~/.jupyter
function jupyterConfigDir () {
  var homeDir = userHome();
  if (process.env.JUPYTER_CONFIG_DIR) {
    return process.env.JUPYTER_CONFIG_DIR;
  }
  return path.join(homeDir, '.jupyter');
}

// Get the config directory for Jupyter data files.
//
// These are non-transient, non-configuration files.
//
// Returns process.env[JUPYTER_DATA_DIR] if defined,
// else a platform-appropriate path.
function jupyterDataDir() {
  if (process.env.JUPYTER_DATA_DIR){
    return process.env.JUPYTER_DATA_DIR;
  }
  else if (process.platform == 'win32') {
    appData = process.env.APPDATA;
    if (appData) {
      return path.join(appData, 'jupyter');
    }
    else {
      return path.join(jupyterConfigDir(), 'data');
    }
  }
  else if (process.platform == 'darwin') {
    return path.join(userHome(), 'Library', 'Jupyter');
  }
  else {
    // Linux, non-OS X Unix, AIX, etc.
    var xdg = process.env.XDG_DATA_HOME;
    if (!xdg) {
      xdg = path.join(userHome(), '.local', 'share');
    }
    return path.join(xdg, 'jupyter');
  }
}

// Returns the path for ~/.ipython
function ipythonDataDir() {
  return path.join(userHome(), '.ipython');
}

// Return the runtime dir for transient jupyter files.
//
// Returns process.env[JUPYTER_RUNTIME_DIR] if defined.
//
// Respects XDG_RUNTIME_DIR on non-OS X, non-Windows,
//   falls back on data_dir/runtime otherwise.
function jupyterRuntimeDir() {
  if (process.env.JUPYTER_RUNTIME_DIR){
    return process.env.JUPYTER_RUNTIME_DIR;
  }
  if (process.platform == 'darwin' || process.platform == 'win32'){
    return path.join(jupyterDataDir(), 'runtime');
  }
  else {
    // Linux, non-OS X Unix, AIX, etc.
    xdg = process.env.XDG_RUNTIME_DIR;
    if (xdg) {
      // Ref https://github.com/jupyter/jupyter_core/commit/176b7a9067bfc20bfa97be5dae93912e2930a427#commitcomment-11331375
      return path.join(xdg, 'jupyter');
    }
    return path.join(jupyterDataDir, 'runtime');
  }
}


/**
 * Return the list of directories to search
 * JUPYTER_PATH environment variable has highest priority.
 *
 * If subdirs are given, that subdirectory path will be added to each element.
 * Examples:
 *
 * > jupyterPath()
 * ['/Users/rgbkrk/.local/jupyter', '/usr/local/share/jupyter']
 *
 * > jupyterPath('kernels')
 * ['/Users/rgbkrk/.local/jupyter/kernels', '/usr/local/share/jupyter/kernels']
 */
function jupyterPath() {
  var subdir;
  var paths = [];
  var i;

  if (arguments) {
    subdir = path.join.apply(null, arguments);
  }

  // highest priority is env
  if (process.env.JUPYTER_PATH){
    jupyterPathEnvSplit = process.env.JUPYTER_PATH.split(path.delimiter);

    jupyterPathEnvSplit.forEach(function(p){
      // Strip off the path separator from the right
      normalizedP = p.replace(RegExp(path.sep + "+$"), "");
      paths.push(normalizedP);
    });
  }

  // Next up, user directory
  paths.push(jupyterDataDir());

  // Oh joy, it's sys.prefix
  ENV_JUPYTER_PATH.forEach(function(p) {
    if (! (p in SYSTEM_JUPYTER_PATH)) {
      paths.push(p);
    }
  });

  SYSTEM_JUPYTER_PATH.forEach(function(p){
    paths.push(p);
  });

  paths.push(ipythonDataDir());

  // Append the subdir
  if (subdir) {
    paths = paths.map(function(p){
      return path.join(p, subdir);
    });
  }

  return paths;
}
