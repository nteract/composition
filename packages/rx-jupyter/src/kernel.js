import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/operator/map';

/**
 * Creates the configuration needed to send a /kernelspecs request to the
 * services API.
 *
 * @returns {Object}  The configuration for a /kernelspecs request
 */
export function createAllKernelSpec(endpoint, crossDomain) {
  const url = endpoint + '/api/kernelspecs';
  return {
    url,
    crossDomain,
    responseType: 'json',
  };
}

export function getAllKernelSpec$(endpoint, crossDomain) {
  return ajax(createAllKernelSpec(endpoint, crossDomain));
}

export function createAllKernel(endpoint, crossDomain) {
  const url = endpoint + '/api/kernels';
  return {
    url,
    crossDomain,
    responseType: 'json',
  };
}

export function getAllKernel$(endpoint, crossDomain) {
  return ajax(createAllKernel(endpoint, crossDomain));
}

export function createKernel(endpoint, crossDomain, id) {
  const url = endpoint + '/api/kernels/' + id;
  return {
    url,
    crossDomain,
    responseType: 'json',
  };
}

export function getKernel$(endpoint, crossDomain, id) {
  return ajax(createKernel(endpoint, crossDomain));
}

export function createLaunchKernel(endpoint, crossDomain, name, path) {
  const url = endpoint + '/api/kernels';
  return {
    url,
    crossDomain,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {
      path,
      kernel_name: name,
    }
  };
}

export function launchKernel$(endpoint, crossDomain, name, path) {
  return ajax(createLaunchKernel(endpoint, crossDomain, name, path));
}
