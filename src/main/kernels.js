import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/empty";

import { spawn } from "spawn-rx";

const path = require("path");

/**
 * ipyKernelTryObservable checks for the existence of ipykernel in the environment.
 * @param  {Object} env - Current environment
 * @returns {Observable}  Source environment
 */
export function ipyKernelTryObservable(env) {
  const executable = path.join(env.prefix, "bin", "python");
  return spawn(executable, ["-m", "ipykernel", "--version"], { split: true })
    .filter(x => x.source && x.source === "stdout")
    .mapTo(env)
    .catch(() => Observable.empty());
}

/**
  * condaInfoObservable executes the conda info --json command and maps the
  * result to an observable that parses through the environmental informaiton.
  * @returns {Observable}  JSON parsed information
  */
export function condaInfoObservable() {
  return spawn("conda", ["info", "--json"]).map(info => JSON.parse(info));
}

/**
  * condaEnvsObservable will return an observable that emits the environmental
  * paths of the passed in observable.
  * @param {Observable} condaInfo$ - Environmental information
  * @returns {Observable}  List of envionmental variables
  */
export function condaEnvsObservable(condaInfo$) {
  return condaInfo$
    .map(info => {
      const envs = info.envs.map(env => ({
        name: path.basename(env),
        prefix: env
      }));
      envs.push({ name: "root", prefix: info.root_prefix });
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
export function createKernelSpecsFromEnvs(envs) {
  const displayPrefix = "Python"; // Or R
  const languageKey = "py"; // or r

  const languageExe = "bin/python";

  const langEnvs = {};

  Object.keys(envs).forEach(env => {
    const base = env.prefix;
    const exePath = path.join(base, languageExe);
    const envName = env.name;
    const name = `conda-env-${envName}-${languageKey}`;
    langEnvs[name] = {
      display_name: `${displayPrefix} [conda env:${envName}]`,
      argv: [exePath, "-m", "ipykernel", "-f", "{connection_file}"],
      language: "python"
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
  return condaEnvsObservable(condaInfoObservable()).map(
    createKernelSpecsFromEnvs
  );
}
