import * as kernels from './kernel.js';

export const JupyterAPI = function(endpoint, crossDomain) {
  this.endpoint = endpoint;
  this.crossDomain = crossDomain;
}

JupyterAPI.prototype.getAllKernelSpec$ = function() {
  return kernels.getAllKernelSpec$(this.endpoint, this.crossDomain);
}
JupyterAPI.prototype.getAllKernel$ = function() {
  return kernels.getAllKernel$(this.endpoint, this.crossDomain);
}
JupyterAPI.prototype.getKernel$ = function() {
  return kernels.getKernel$(this.endpoint, this.crossDomain);
}
JupyterAPI.prototype.launchKernel$ = function() {
  return kernels.launchKernel$(this.endpoint, this.crossDomain);
}
