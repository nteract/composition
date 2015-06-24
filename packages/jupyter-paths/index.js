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
 */

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

function JupyterPaths() {
  var pathsResponse, path;

  try {
    pathsResponse = child_process.spawnSync('jupyter',  ['--paths', '--json']);
    _path = JSON.parse(pathsResponse.stdout.toString());
  } catch(e) {
    console.error(e);
    console.error(pathsResponse.stdout.toString());
    console.error(pathsResponse.stderr.toString());
    return;
  }

  this.path = _path;
}

// Get the Jupyter config directory for this platform and user.
JupyterPaths.prototype.configDirs = function () {
  return this.path.config;
};

/**
 * Get the config directory for Jupyter data files.
 * These are non-transient, non-configuration files.
 */
JupyterPaths.prototype.dataDirs = function() {
  return this.path.data;
};

// Return the runtime dirs for transient jupyter files.
JupyterPaths.prototype.runtimeDirs = function() {
  return this.path.runtime;
};

JupyterPaths.prototype.kernelDirs = function() {
  var dataDirs = this.dataDirs();

  return dataDirs.map(function(p){
    return path.join(p, "kernels");
  });
};

module.exports = new JupyterPaths();
