import { KernelspecInfo } from "@nteract/core";
import { JupyterConnectionInfo } from "enchannel-zmq-backend";
import { readdirObservable, readFileObservable } from "fs-observable";
import * as jupyterPaths from "jupyter-paths";
import * as path from "path";
import { EMPTY, Observable } from "rxjs";
import {
  catchError,
  filter,
  map,
  mapTo,
  mergeAll,
  toArray
} from "rxjs/operators";
import { spawn } from "spawn-rx";

/**
 * ipyKernelTryObservable checks for the existence of ipykernel in the environment.
 */
export function ipyKernelTryObservable(env: { prefix: string; name: string }) {
  const executable = path.join(env.prefix, "bin", "python");
  return (spawn(executable, ["-m", "ipykernel", "--version"], {
    split: true // When split is true the observable's return value is { source: 'stdout', text: '...' }
  }) as Observable<{ source: "stdout" | "stderr"; text: string }>).pipe(
    filter(x => x.source && x.source === "stdout"),
    mapTo(env),
    catchError(() => EMPTY)
  );
}

interface CondaInfoJSON {
  GID: number;
  UID: number;
  active_prefix: null;
  active_prefix_name: null;
  channels: string[];
  conda_build_version: string;
  conda_env_version: string;
  conda_location: string;
  conda_prefix: string;
  conda_private: boolean;
  conda_shlvl: number;
  conda_version: string;
  config_files: string[];
  default_prefix: string;
  env_vars: EnvVars;
  envs: string[];
  envs_dirs: string[];
  netrc_file: null;
  offline: boolean;
  pkgs_dirs: string[];
  platform: string;
  python_version: string;
  rc_path: string;
  requests_version: string;
  root_prefix: string;
  root_writable: boolean;
  site_dirs: string[];
  "sys.executable": string;
  "sys.prefix": string;
  "sys.version": string;
  sys_rc_path: string;
  user_agent: string;
  user_rc_path: string;
}
interface EnvVars {
  CIO_TEST: string;
  CONDA_ROOT: string;
  GOPATH: string;
  PATH: string;
  REQUESTS_CA_BUNDLE: string;
  SSL_CERT_FILE: string;
}

/**
 * condaInfoObservable executes the conda info --json command and maps the
 * result to an observable that parses through the environmental informaiton.
 */
export function condaInfoObservable(): Observable<CondaInfoJSON> {
  return spawn("conda", ["info", "--json"]).pipe(map(info => JSON.parse(info)));
}

/**
 * condaEnvsObservable will return an observable that emits the environmental
 * paths of the passed in observable.
 */
export function condaEnvsObservable(condaInfo$: Observable<CondaInfoJSON>) {
  return condaInfo$.pipe(
    map(info => {
      const envs = info.envs.map((env: string) => ({
        name: path.basename(env),
        prefix: env
      }));
      envs.push({ name: "root", prefix: info.root_prefix });
      return envs;
    }),
    map(envs => envs.map(ipyKernelTryObservable)),
    mergeAll(),
    mergeAll(),
    toArray()
  );
}

/**
 * createKernelSpecsFromEnvs generates a dictionary with the supported langauge
 * paths.
 */
export function createKernelSpecsFromEnvs(
  envs: Array<{ name: string; prefix: string }>
) {
  const displayPrefix = "Python"; // Or R
  const languageKey = "py"; // or r

  const languageExe = "bin/python";

  const langEnvs: {
    [name: string]: KernelspecInfo["spec"] & { argv: string[] };
  } = {};

  envs.forEach(env => {
    const base = env.prefix;
    const exePath = path.join(base, languageExe);
    const envName = env.name;
    const name = `conda-env-${envName}-${languageKey}`;
    langEnvs[name] = {
      name,
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
  return condaEnvsObservable(condaInfoObservable()).pipe(
    map(createKernelSpecsFromEnvs)
  );
}

/**
 * runningKernelsObservable generates an observable containing the connection
 * info for all kernels found in the jupyter runtime dir.
 */
export function runningKernelsObservable(): Observable<JupyterConnectionInfo> {
  return (
    readdirObservable(jupyterPaths.runtimeDir()) as
      Observable<string[]> // FIXME ts should infer this
  ).pipe(
    mergeAll(),
    map(x => path.join(jupyterPaths.runtimeDir(), x)),
    map(x => readFileObservable(x).pipe(
      catchError(() => EMPTY)
    )),
    mergeAll(),
    map(x => x.toString()),
    map(x => JSON.parse(x))
  );
}
