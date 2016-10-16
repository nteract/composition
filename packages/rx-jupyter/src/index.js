import * as kernels from './kernels';
import * as kernelspecs from './kernelspecs';

export function JupyterAPI(endpoint, crossDomain) {
  this.endpoint = endpoint;
  this.crossDomain = crossDomain;
}

JupyterAPI.prototype.getConfig = function() {
  return {
    endpoint: this.endpoint,
    crossDomain: this.crossDomain,
  };
}

JupyterAPI.prototype.listKernelspecs = function() {
  return kernelspecs.list(this.getConfig());
}

JupyterAPI.prototype.listKernels = function() {
  return kernels.list(this.getConfig());
}

JupyterAPI.prototype.getKernel = function(id) {
  return kernels.get(this.getConfig(), id);
}

JupyterAPI.prototype.startKernel = function(name, path) {
  return kernels.start(this.getConfig(), name, path);
}
