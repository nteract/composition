/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2015, Kyle Kelley and others as credited in the AUTHORS file
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

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

function Jupyter() {
  // Since sysPrefix and userHome are used all over the place (and should stay the same during run)
  // these are done synchronously for initialization.

  // Access `sys.prefix` from Python, to handle particular conda and virtualenv setups
  // TODO: Provide a timeout, handle error
  var response = child_process.spawnSync('python', ['-c', 'import sys; print(sys.prefix)']);
  var sysPrefix = response.stdout.toString().replace(/^\s+|\s+$/g, "");

  this.sysPrefix = fs.realpathSync(sysPrefix);

  var versionCheck = child_process.spawnSync('python', [ path.join(__dirname, 'wrap.py') ]);

  stdout = versionCheck.stdout.toString();
  stderr = versionCheck.stdout.toString();

  if (stderr !== '') {
    try {
      console.error(JSON.parse(stderr));
    } catch(e) {
      console.error(e);
    }
  }

  // Cache the user home directory
  this.userHome = process.env.HOME || process.env.USERPROFILE || path.resolve('~');
  this.userHome = fs.realpathSync(this.userHome);

  // Globally installed Jupyter components, particularly kernel specs
  this.SYSTEM_JUPYTER_PATHS = [];
  this.ENV_JUPYTER_PATHS = [];

  // Compute default system configurations
  if (process.platform == 'win32') {
    programData = process.env.PROGRAMDATA;
    if (programData){
      this.SYSTEM_JUPYTER_PATHS = [path.join(programData, 'jupyter')];
    }
    else {
      this.SYSTEM_JUPYTER_PATHS = [path.join(sysPrefix, 'share', 'jupyter')];
    }
  }
  else {
    this.SYSTEM_JUPYTER_PATHS = [
      "/usr/local/share/jupyter",
      "/usr/share/jupyter"
    ];
  }

  this.ENV_JUPYTER_PATHS = [path.join(sysPrefix, 'share', 'jupyter')];

  this.SYSTEM_CONFIG_PATHS = [];

  if (process.platform == 'win32') {
    programData = process.env.PROGRAMDATA;
    if (programData){
      this.SYSTEM_CONFIG_PATHS = [path.join(programData, 'jupyter')];
    } else { // PROGRAMDATA is not defined by default in XP
      this.SYSTEM_CONFIG_PATHS = [];
    }
  } else {
    this.SYSTEM_CONFIG_PATHS = [
      "/usr/local/etc/jupyter",
      "/etc/jupyter"
    ];
  }

  this.ENV_CONFIG_PATHS = [path.join(sysPrefix, 'etc', 'jupyter')];
}

// Get the Jupyter config directory for this platform and user.
// Returns env[JUPYTER_CONFIG_DIR] if defined, else ~/.jupyter
Jupyter.prototype.configDir = function () {
  if (process.env.JUPYTER_CONFIG_DIR) {
    return process.env.JUPYTER_CONFIG_DIR;
  }
  return path.join(this.userHome, '.jupyter');
};

/**
 * Get the config directory for Jupyter data files.
 * These are non-transient, non-configuration files.
 *
 * Returns process.env[JUPYTER_DATA_DIR] if defined,
 * else a platform-appropriate path.
 */
Jupyter.prototype.dataDir = function() {
  if (process.env.JUPYTER_DATA_DIR){
    return process.env.JUPYTER_DATA_DIR;
  }
  else if (process.platform == 'win32') {
    appData = process.env.APPDATA;
    if (appData) {
      return path.join(appData, 'jupyter');
    }
    else {
      return path.join(this.jupyterConfigDir(), 'data');
    }
  }
  else if (process.platform == 'darwin') {
    return path.join(this.userHome, 'Library', 'Jupyter');
  }
  else {
    // Linux, non-OS X Unix, AIX, etc.
    var xdg = process.env.XDG_DATA_HOME;
    if (!xdg) {
      xdg = path.join(this.userHome, '.local', 'share');
    }
    return path.join(xdg, 'jupyter');
  }
};

// Returns the path for ~/.ipython
Jupyter.prototype.ipythonDataDir = function() {
  return path.join(this.userHome, '.ipython');
};

// Return the runtime dirs for transient jupyter files.
//
// Returns process.env[JUPYTER_RUNTIME_DIR] if defined.
//
// Respects XDG_RUNTIME_DIR on non-OS X, non-Windows,
//   falls back on data_dir/runtime otherwise.
Jupyter.prototype.runtimeDirs = function() {
  if (process.env.JUPYTER_RUNTIME_DIR){
    return [process.env.JUPYTER_RUNTIME_DIR];
  }
  if (process.platform == 'darwin' || process.platform == 'win32'){
    return [path.join(this.dataDir(), 'runtime')];
  }
  else {
    // Linux, non-OS X Unix, AIX, etc.
    xdg = process.env.XDG_RUNTIME_DIR;
    if (xdg) {
      // Ref https://github.com/jupyter/jupyter_core/commit/176b7a9067bfc20bfa97be5dae93912e2930a427#commitcomment-11331375
      return [path.join(xdg, 'jupyter')];
    }
    return [path.join(this.dataDir(), 'runtime')];
  }
};


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
Jupyter.prototype._path = function () {
  var subdir;
  var paths = [];
  var i;

  // Allows for nested directories
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
  paths.push(this.jupyterDataDir());

  // Oh joy, it's sys.prefix
  this.ENV_JUPYTER_PATH.forEach(function(p) {
    if (! (p in this.SYSTEM_JUPYTER_PATH)) {
      paths.push(p);
    }
  });

  this.SYSTEM_JUPYTER_PATH.forEach(function(p){
    paths.push(p);
  });

  paths.push(this.ipythonDataDir());

  // Append the subdir
  if (subdir) {
    paths = paths.map(function(p){
      return path.join(p, subdir);
    });
  }

  return paths;
};

Jupyter.prototype.configPath = function() {
  var paths = [jupyterConfigDir()];
  this.ENV_CONFIG_PATH.forEach(function(p){
    if (! (p in this.SYSTEM_CONFIG_PATH)) {
      paths.push(p);
    }
  });
  paths.push.apply(paths, this.SYSTEM_CONFIG_PATH);
  return paths;
};

module.exports = new Jupyter();
