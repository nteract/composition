/**
 * @module jupyter-paths
 *
 * @description Module `jupyter-paths` provides path helpers ported from github.com/jupyter/jupyter_core
 */

var path = require('path');
var child_process = require('child_process');

function JupyterPaths() {
  var pathsResponse;

  try {
    pathsResponse = child_process.spawnSync('jupyter',  ['--paths', '--json']);
    _path = JSON.parse(pathsResponse.stdout.toString());
  } catch(e) {
    console.error(e);
    console.error(pathsResponse.stdout.toString());
    console.error(pathsResponse.stderr.toString());
    return;
  }

  this.paths = _path;

  var dataDir = this.paths.data;

  this.paths.kernelspecs = dataDir.map(function(p){
    return path.join(p, "kernels");
  });

}

module.exports = new JupyterPaths();
