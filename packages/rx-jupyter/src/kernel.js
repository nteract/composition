import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/operator/map';

import * as constants from './constants';

/**
 * Creates the configuration needed to send a /kernelspecs request to the
 * services API.
 *
 * @returns {Object}  The configuration for a /kernelspecs request
 */
export function createAllKernelSpec() {
  const url = constants.ENDPOINT + '/kernelspecs';
  return {
    url,
    crossDomain: true,
    responseType: 'json',
  };
}

export function getAllKernelSepc$() {
  return ajax(createAllKernelSpec())
          .map(data => data.response.kernelspecs);
}

export function createAllKernel() {
  const url = constants.ENDPOINT + '/kernels';
  return {
    url,
    crossDomain: true,
    responseType: 'json',
  };
}

export function getAllKernel$() {
  return ajax(createAllKernel())
          .map(data => data.response);
}

export function createKernel(id) {
  const url = constants.ENDPOINT + '/kernels/' + id;
  return {
    url,
    crossDomain: true,
    responseType: 'json',
  };
}

export function getKernel$(id) {
  return ajax(createKernel)
  .map(data =>  data.response);
}

export function createLaunchKernel(name, path) {
  const url = constants.ENDPOINT + '/kernels';
  return {
    url,
    crossDomain: true,
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

export function launchKernel$(name, path) {
  return ajax(createLaunchKernel(name, path));
}
