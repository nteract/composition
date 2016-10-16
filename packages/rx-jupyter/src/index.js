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
JupyterAPI.prototype.getKernel$ = function(id) {
  return kernels.getKernel$(this.endpoint, this.crossDomain, id);
}
JupyterAPI.prototype.launchKernel$ = function(name, path) {
  return kernels.launchKernel$(this.endpoint, this.crossDomain, name, path);
}
