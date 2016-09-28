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

export function condaKernelSpecsObservable(condaPrefix$) {
  return condaPrefix$;
}

export function createKernelSpecsFromEnvs(envs) {
  const displayPrefix = 'Python'; // Or R
  const languageKey = 'py'; // or r

  // TODO: Handle Windows & Conda
  const languageExe = 'bin/python';
  const jupyterBin = 'bin/jupyter';

  const langEnvs = {};

  // Check for existence
  for (const env of envs) {
    const base = env.prefix;
    const exePath = path.join(base, languageExe);
    // TODO: if exists(path.join(base, jupyter)) and exists(exePath)
    //       --> will need to write the observable logic for that...
    // TODO: Alternatively: `bin/Python -m ipykernel --version`
    const envName = env.name;
    const name = `conda-env-${envName}-${languageKey}`;
    langEnvs[name] = {
      display_name: `${displayPrefix} [conda env:${envName}]`,
      // TODO: Support default R kernel
      argv: [exePath, '-m', 'ipykernel', '-f', '{connection_file}'],
      language: 'python',
      // TODO: Provide resource_dir
    };
  }
  return langEnvs;
}


export function condaKernelsEpic(action$, store) {
  return action$.ofType('GET_CONDA_KERNELS')
    .switchMap(action => condaEnvsObservable(condaInfoObservable()))
    .map(createKernelSpecsFromEnvs)
    .map(condaInfo => ({ type: 'CONDA_ENVS', payload: condaInfo }));
}
