import Rx from 'rxjs/Rx';

import {
  spawn,
} from 'spawn-rx';

const path = require('path');

/**
 * ipyKernelTryObservable check for existence of ipykernel in an env
 * @param  {Object} env [description]
 * @return {[type]}     [description]
 */
export function ipyKernelTryObservable(env) {
  const executable = path.join(env.prefix, 'bin', 'python');
  return spawn(executable, ['-m', 'ipykernel', '--version'], { split: true })
    .filter(x => x.source && x.source === 'stdout')
    .mapTo(env)
    .catch(err => Rx.Observable.empty());
}

export function condaInfoObservable() {
  return spawn('conda', ['info', '--json'])
    .map(info => JSON.parse(info));
}

export function condaEnvsObservable(condaInfo$) {
  return condaInfo$.map(info => {
    const envs = info.envs.map(env => ({ name: path.basename(env), prefix: env }));
    envs.push({ name: 'root', prefix: info.root_prefix });
    return envs;
  })
  .map(envs => envs.map(ipyKernelTryObservable))
  .mergeAll()
  .mergeAll()
  .toArray();
}

export function createKernelSpecsFromEnvs(envs) {
  const displayPrefix = 'Python'; // Or R
  const languageKey = 'py'; // or r

  const languageExe = 'bin/python';
  const jupyterBin = 'bin/jupyter';

  const langEnvs = {};

  Object.keys(envs).forEach((env) => {
    const base = env.prefix;
    const exePath = path.join(base, languageExe);
    const envName = env.name;
    const name = `conda-env-${envName}-${languageKey}`;
    langEnvs[name] = {
      display_name: `${displayPrefix} [conda env:${envName}]`,
      argv: [exePath, '-m', 'ipykernel', '-f', '{connection_file}'],
      language: 'python',
    };
  });
  return langEnvs;
}

export function condaKernelsObservable() {
  return condaEnvsObservable(condaInfoObservable())
    .map(createKernelSpecsFromEnvs);
}
