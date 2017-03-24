/* @flow */

import Rx from 'rxjs/Rx';

import {
  spawn,
  findActualExecutable,
} from 'spawn-rx';

const path = require('path');

const kernelspecs = require('kernelspecs');

type Environment = {
  prefix: string,
};

function spawnIPyKernelObservable(executable = 'python') {
  return spawn(executable, ['-m', 'ipykernel', '--version'], { split: true })
    .filter(x => x.source && x.source === 'stdout');
}

/**
 * ipyKernelTryObservable checks for the existence of ipykernel in the environment.
 * @param  {Object} env - Current environment
 * @returns {Observable}  Source environment
 */
export function ipyKernelTryObservable(env: Environment) {
  const executable = path.join(env.prefix, 'bin', 'python');
  spawnIPyKernelObservable(executable)
    .mapTo(env)
    .catch(() => Rx.Observable.empty());
}

function formIPyKernelArgv(exePath: string) {
  return [exePath, '-m', 'ipykernel', '-f', '{connection_file}'];
}

export function defaultPythonTryObservable() {
  return spawnIPyKernelObservable()
    .mapTo({
      python: {
        name: 'python',
        spec: {
          argv: formIPyKernelArgv('python'),
          display_name: `Python (${findActualExecutable('python').cmd})`,
          language: 'python',
        },
      },
    })
    .catch(() => Rx.Observable.empty());
}


/**
  * condaInfoObservable executes the conda info --json command and maps the
  * result to an observable that parses through the environmental informaiton.
  * @returns {Observable}  JSON parsed information
  */
export function condaInfoObservable() {
  return spawn('conda', ['info', '--json'])
    .map(info => JSON.parse(info));
}

/**
  * condaEnvsObservable will return an observable that emits the environmental
  * paths of the passed in observable.
  * @param {Observable} condaInfo$ - Environmental information
  * @returns {Observable}  List of envionmental variables
  */
export function condaEnvsObservable(condaInfo$: Rx.Observable) {
  return condaInfo$.map((info) => {
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
  * createKernelSpecsFromEnvs generates a dictionary with the supported langauge
  * paths.
  * @param {Observable} envs - Environmental elements
  * @returns {Object}   Dictionary containing supported langauges paths.
  */
export function createKernelSpecsFromEnvs(envs: Object) {
  const displayPrefix = 'Python'; // Or R
  const languageKey = 'py'; // or r

  const languageExe = 'bin/python';

  const langEnvs = {};

  Object.keys(envs).forEach((envKey) => {
    const env = envs[envKey];
    const base = env.prefix;
    const exePath = path.join(base, languageExe);
    const envName = env.name;
    const name = `conda-env-${envName}-${languageKey}`;
    langEnvs[name] = {
      display_name: `${displayPrefix} [conda env:${envName}]`,
      argv: formIPyKernelArgv(exePath),
      language: 'python',
    };
  });
  return langEnvs;
}

/**
  * condaKernelObservable generates an observable containing the supported languages
  * environmental elements.
  * @returns {Observable}  Supported language elements
  */
export function condaKernelsObservable() {
  return condaEnvsObservable(condaInfoObservable())
    .map(createKernelSpecsFromEnvs);
}

export function findAll() {
  return defaultPythonTryObservable()
    .concat(
      Rx.Observable.fromPromise(kernelspecs.findAll())
    )
    .reduce((kernels, kernelSpecs) =>
      Object.assign({}, kernels, kernelSpecs), {}
    );
}
