import { ajax } from 'rxjs/observable/dom/ajax';

import * as kernels from './kernels';
import * as kernelspecs from './kernelspecs';
import * as sessions from './sessions';

function apiVersion(serverConfig) {
  return ajax({
    url: `${serverConfig.endpoint}/api`,
    crossDomain: serverConfig.crossDomain,
    responseType: 'json',
  });
}

export { apiVersion, kernels, kernelspecs, sessions };
