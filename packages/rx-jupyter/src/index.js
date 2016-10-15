import * as kernels from './kernel.js';

const JupyterAPI = function(endpoint, crossDomain) {
  this.endpoint = endpoint;
  this.crossDomain = crossDomain;
}

JupyterAPI.prototype.getAllKernelSpec$ = function() {
  return kernels.getAllKernelSpec$.bind(null, this.endpoint, this.crossDomain);
}
JupyterAPI.prototype.getAllKernel$ = function() {
  return kernels.getAllKernel$.bind(null, this.endpoint, this.crossDomain);
}
JupyterAPI.prototype.getKernel$ = function() {
  return kernels.getKernel$.bind(null, this.endpoint, this.crossDomain);
}
JupyterAPI.prototype.launchKernel$ = function() {
  return kernels.launchKernel$.bind(null, this.endpoint, this.crossDomain);
}

export { JupyterAPI };
