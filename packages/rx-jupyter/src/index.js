import * as kernels from './kernels';
import * as kernelspecs from './kernelspecs';

export function JupyterAPI(endpoint, crossDomain) {
  this.endpoint = endpoint;
  this.crossDomain = crossDomain;
}

JupyterAPI.prototype.listKernelspecs = function() {
  return kernelspecs.list(this.endpoint, this.crossDomain);
}

JupyterAPI.prototype.listKernels = function() {
  return kernels.list(this.endpoint, this.crossDomain);
}

JupyterAPI.prototype.getKernel = function(id) {
  return kernels.get(this.endpoint, this.crossDomain, id);
}

JupyterAPI.prototype.startKernel = function(name, path) {
  return kernels.start(this.endpoint, this.crossDomain, name, path);
}
