import Rx from 'rxjs/Rx';

import {
  spawn,
} from 'spawn-rx';

const path = require('path');

/**
 * ipyKernelTryObservable check for existence of ipykernel in an env
 * @param  {Object} env  the current environment
 * @return {Observable}  an observable that emits the environment when the
 * source observable is also emitting something (source comes from the spawn())
 */
export function ipyKernelTryObservable(env) {
  const executable = path.join(env.prefix, 'bin', 'python');
  return spawn(executable, ['-m', 'ipykernel', '--version'], { split: true })
    .filter(x => x.source && x.source === 'stdout')
    .mapTo(env)
    .catch(err => Rx.Observable.empty());
}

/**
  * condaInfoObservable executes the conda indo --json command and maps the
  * result to an observable that parses through the environmental informaiton.
  * @return {Observable}  observable that emits the JSON parsed info
  */
export function condaInfoObservable() {
  return spawn('conda', ['info', '--json'])
    .map(info => JSON.parse(info));
}

/**
  * condaEnvsObservable that will return an observable that emits the environmental
  * paths of the passed in observable.
  * @param {Observable}   takes in an observable with environmental information.
  * @return {Observable}  an observable that contains a list of environmental
  * elements.
  */
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

/**
  * createKernelSpecsFromEnvs generates a dictionary with the environmental paths.
  * @param {Observable}   takes in an observable with environmental elements
  * @return {Object}    returns a dictionary object containing the supported
  * language environments.
  */
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

/**
  * condaKernelObservable generates an observable containing the supported language
  * environmental elements.
  * @return {Observable}  emits supported language elements
  */
export function condaKernelsObservable() {
  return condaEnvsObservable(condaInfoObservable())
    .map(createKernelSpecsFromEnvs);
}
