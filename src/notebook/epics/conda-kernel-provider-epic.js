import Rx from 'rxjs/Rx';

import {
  spawn,
} from 'spawn-rx';

const path = require('path');

export function condaInfoObservable() {
  return spawn('conda', ['info', '--json'])
    .map(info => JSON.parse(info));
}

export function condaEnvsObservable(condaInfo$) {
  return condaInfo$.map(info => {
    const envs = info.envs.map(env => ({ name: path.basename(env), prefix: env }));
    envs.push({ name: 'root', prefix: info.root_prefix });
    return envs;
  });
}

export function condaKernelsEpic(action$, store) {
  return action$.ofType('GET_CONDA_KERNELS')
    .switchMap(action => condaEnvsObservable(condaInfoObservable()))
    .map(condaInfo => ({ type: 'CONDA_ENVS', payload: condaInfo }));
}
