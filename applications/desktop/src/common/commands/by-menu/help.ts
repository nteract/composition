import { sendNotification } from "@nteract/mythic-notifications";
import { dialog } from "electron";
import * as fs from "fs";
import { createSymlinkObservable, writeFileObservable } from "fs-observable";
import { join } from "path";
import { merge, Observable } from "rxjs";
import { catchError, mergeMap } from "rxjs/operators";
import { spawn } from "spawn-rx";
import { DesktopCommand, ReqContent } from "../types";

export const InstallShellCommand: DesktopCommand<ReqContent> = {
  name: "InstallShellCommand",
  props: {
    contentRef: "required",
  },
  async *makeActions(store) {
    const makeGithubNotification = (message: string) =>
      sendNotification.with({
        level: "in-progress",
        key: "github-publish",
        icon: "book",
        title: "Publishing Gist",
        message,
      });

    if (!process.resourcesPath) {
      throw new Error("resources path not set for nteract electron app");
    }

    const subdir = process.platform === "darwin" ? "MacOS" : "";
    const ext = process.platform === "win32" ? ".exe" : "";
    const win = process.platform === "win32" ? "win" : "";
    const dir = join(process.resourcesPath, "..", subdir);

    const nteractPath = join(dir, `nteract${ext}`);
    const electronPath = join(dir, `electron${ext}`);

    let exe: string;
    let rootDir: string;
    let binDir: string;

    if (fs.existsSync(nteractPath)) {
      exe = nteractPath;
      rootDir = "";
      binDir = join(process.resourcesPath, "bin", win);
    } else if (fs.existsSync(electronPath)) {
      // Developer install
      exe = electronPath;
      rootDir = dir.split("node_modules")[0];
      binDir = join(rootDir, "bin", win);
    } else {
      dialog.showErrorBox(
        "nteract application not found.",
        "Could not locate nteract executable."
      );
      return;
    }

    (
      process.platform === "win32"
        ? merge(
        spawn("SETX",
          ["PATH",
            [
              ...(process.env.PATH || "")
                .split(";")
                .filter(item => !/\bnteract\b/.test(item))
                // Remove duplicates (SETX throws a error if path is to long)
                .filter((item, index, array) => array.indexOf(item) === index),
              binDir,
            ].join(";")]),
        spawn("SETX", ["NTERACT_EXE", exe]),
        spawn("SETX", ["NTERACT_DIR", rootDir])
        ) as Observable<void>
        : writeFileObservable(
        join(binDir, "nteract-env"),
        `NTERACT_EXE="${exe}"\nNTERACT_DIR="${rootDir}"`
        ).pipe(
        mergeMap(() => {
          const target = join(binDir, "nteract.sh");
          return createSymlinkObservable(target, "/usr/local/bin/nteract").pipe(
            catchError(() => {
              if (!process.env.HOME) {
                throw new Error("HOME not defined");
              }
              const dest = join(process.env.HOME, ".local/bin/nteract");
              return createSymlinkObservable(target, dest);
            })
          );
        })
        )
    ).subscribe(
      () => undefined,
      err => dialog.showErrorBox("Could not write shell script.", err.message),
      () =>
        dialog.showMessageBox({
          title: "Command installed.",
          message: 'The shell command "nteract" is installed.',
          detail: 'Get help with "nteract --help".',
          buttons: ["OK"]
        })
    );
  },
};
