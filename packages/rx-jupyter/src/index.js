import * as kernels from './kernels';
import * as kernelspecs from './kernelspecs';

export function JupyterAPI(endpoint, crossDomain) {
  this.endpoint = endpoint;
  this.crossDomain = crossDomain;
}

JupyterAPI.prototype.listKernelspecs = function() {
  return kernelspecs.list(this);
}

JupyterAPI.prototype.listKernels = function() {
  return kernels.list(this);
}

JupyterAPI.prototype.getKernel = function(id) {
  return kernels.get(this, id);
}

JupyterAPI.prototype.startKernel = function(name, path) {
  return kernels.start(this, name, path);
}
