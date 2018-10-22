/* @flow strict */
import { join } from "path";

import { catchError, mergeMap } from "rxjs/operators";
import { merge } from "rxjs";
import { dialog } from "electron";
import { spawn } from "spawn-rx";
import { writeFileObservable, createSymlinkObservable } from "fs-observable";

// Overwrite the type for `process` to match Electron's process
// https://electronjs.org/docs/api/process
// eslint-disable-next-line no-unused-vars
declare var ElectronProcess: typeof process & {
  resourcesPath: string
};
declare var process: ElectronProcess;

const fs = require("fs");

const getStartCommand = () => {
  const subdir = process.platform === "darwin" ? "MacOS" : "";
  const ext = process.platform === "win32" ? ".exe" : "";
  const win = process.platform === "win32" ? "win" : "";
  const dir = join(process.resourcesPath, "..", subdir);

  const nteractPath = join(dir, `nteract${ext}`);
  const electronPath = join(dir, `electron${ext}`);

  if (fs.existsSync(nteractPath)) {
    return [nteractPath, "", join(process.resourcesPath, "bin", win)];
  } else if (fs.existsSync(electronPath)) {
    // Developer install
    const rootDir = dir.split("node_modules")[0];
    return [electronPath, rootDir, join(rootDir, "bin", win)];
  }
  return null;
};

const setWinPathObservable = (exe, rootDir, binDir) => {
  // Remove duplicates because SETX throws a error if path is to long
  const env = process.env.PATH.split(";")
    .filter(item => !/nteract/.test(item))
    .filter((item, index, array) => array.indexOf(item) === index);
  env.push(binDir);
  const envPath = env.join(";");
  return merge(
    spawn("SETX", ["PATH", `${envPath}`]),
    spawn("SETX", ["NTERACT_EXE", exe]),
    spawn("SETX", ["NTERACT_DIR", rootDir])
  );
};

const installShellCommandsObservable = (
  exe: string,
  rootDir: string,
  binDir: string
) => {
  if (process.platform === "win32") {
    return setWinPathObservable(exe, rootDir, binDir);
  }
  const envFile = join(binDir, "nteract-env");
  return writeFileObservable(
    envFile,
    `NTERACT_EXE="${exe}"\nNTERACT_DIR="${rootDir}"`
  ).pipe(
    mergeMap(() => {
      const target = join(binDir, "nteract.sh");
      return createSymlinkObservable(target, "/usr/local/bin/nteract").pipe(
        catchError(() => {
          const dest = join(process.env.HOME, ".local/bin/nteract");
          return createSymlinkObservable(target, dest);
        })
      );
    })
  );
};

export const installShellCommand = () => {
  const directories = getStartCommand();
  if (!directories) {
    dialog.showErrorBox(
      "nteract application not found.",
      "Could not locate nteract executable."
    );
    return;
  }

  const [exe, rootDir, binDir] = directories;

  installShellCommandsObservable(exe, rootDir, binDir).subscribe(
    () => {},
    err => dialog.showErrorBox("Could not write shell script.", err.message),
    () =>
      dialog.showMessageBox({
        title: "Command installed.",
        message: 'The shell command "nteract" is installed.',
        detail: 'Get help with "nteract --help".',
        buttons: ["OK"]
      })
  );
};
