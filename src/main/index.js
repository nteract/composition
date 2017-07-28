import { Menu, dialog, app, ipcMain as ipc, BrowserWindow } from "electron";
import { resolve, join } from "path";
import { existsSync } from "fs";

import { Subscriber } from "rxjs/Subscriber";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/forkJoin";
import "rxjs/add/observable/zip";

import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/operator/skipUntil";
import "rxjs/add/operator/buffer";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/toPromise";

import {
  mkdirpObservable,
  readFileObservable,
  writeFileObservable
} from "../utils/fs";

import { launch, launchNewNotebook } from "./launch";

import { loadFullMenu } from "./menu";

import prepareEnv from "./prepare-env";
import initializeKernelSpecs from "./kernel-specs";

const log = require("electron-log");

const kernelspecs = require("../../packages/kernelspecs");
const jupyterPaths = require("../../packages/jupyter-paths");
const path = require("path");

const argv = require("yargs")
  .version()
  .usage("Usage: nteract <notebooks> [options]")
  .example("nteract notebook1.ipynb notebook2.ipynb", "Open notebooks")
  .example("nteract --kernel javascript", "Launch a kernel")
  .describe("kernel", "Launch a kernel")
  .default("kernel", "python3")
  .alias("k", "kernel")
  .alias("v", "version")
  .alias("h", "help")
  .describe("verbose", "Display debug information")
  .help("help")
  .parse(process.argv.slice(1));

log.info("args", argv);

const notebooks = argv._
  .filter(x => /(.ipynb)$/.test(x))
  .filter(x => existsSync(resolve(x)));

ipc.on("new-kernel", (event, k) => {
  launchNewNotebook(k);
});

ipc.on("open-notebook", (event, filename) => {
  launch(resolve(filename));
});

const electronReady$ = Observable.fromEvent(app, "ready");

const fullAppReady$ = Observable.zip(electronReady$, prepareEnv).first();

const jupyterConfigDir = path.join(app.getPath("home"), ".jupyter");
const nteractConfigFilename = path.join(jupyterConfigDir, "nteract.json");

const prepJupyterObservable = prepareEnv
  .mergeMap(() =>
    // Create all the directories we need in parallel
    Observable.forkJoin(
      // Ensure the runtime Dir is setup for kernels
      mkdirpObservable(jupyterPaths.runtimeDir()),
      // Ensure the config directory is all set up
      mkdirpObservable(jupyterConfigDir)
    )
  )
  // Set up our configuration file
  .mergeMap(() =>
    readFileObservable(nteractConfigFilename).catch(err => {
      if (err.code === "ENOENT") {
        return writeFileObservable(
          nteractConfigFilename,
          JSON.stringify({
            theme: "light"
          })
        );
      }
      throw err;
    })
  );

const kernelSpecsPromise = prepJupyterObservable
  .toPromise()
  .then(() => kernelspecs.findAll())
  .then(specs => initializeKernelSpecs(specs));

/**
 * Creates an Rx.Subscriber that will create a splash page onNext and close the
 * splash page onComplete.
 * @return {Rx.Subscriber} Splash Window subscriber
 */
export function createSplashSubscriber() {
  let win;

  return Subscriber.create(
    () => {
      win = new BrowserWindow({
        width: 565,
        height: 233,
        useContentSize: true,
        title: "loading",
        frame: false,
        show: false
      });

      const index = join(__dirname, "..", "..", "static", "splash.html");
      win.loadURL(`file://${index}`);
      win.once("ready-to-show", () => {
        win.show();
      });
    },
    null,
    () => {
      // Close the splash page when completed
      if (win) {
        win.close();
      }
    }
  );
}

const appAndKernelSpecsReady = Observable.zip(
  fullAppReady$,
  kernelSpecsPromise
);

electronReady$
  // TODO: Take until first window is shown
  .takeUntil(appAndKernelSpecsReady)
  .subscribe(createSplashSubscriber());

function closeAppOnNonDarwin() {
  // On macOS, we want to keep the app and menu bar active
  if (process.platform !== "darwin") {
    app.quit();
  }
}
const windowAllClosed = Observable.fromEvent(app, "window-all-closed");
windowAllClosed
  .skipUntil(appAndKernelSpecsReady)
  .subscribe(closeAppOnNonDarwin);

const openFile$ = Observable.fromEvent(app, "open-file", (event, filename) => ({
  event,
  filename
}));

function openFileFromEvent({ event, filename }) {
  event.preventDefault();
  launch(resolve(filename));
}

// Since we can't launch until app is ready
// and macOS will send the open-file events early,
// buffer those that come early.
openFile$.buffer(fullAppReady$).first().subscribe(buffer => {
  // Form an array of open-file events from before app-ready // Should only be the first
  // Now we can choose whether to open the default notebook
  // based on if arguments went through argv or through open-file events
  if (notebooks.length <= 0 && buffer.length <= 0) {
    log.info("launching an empty notebook by default");
    kernelSpecsPromise.then(specs => {
      let kernel;

      if (argv.kernel in specs) {
        kernel = argv.kernel;
      } else if ("python2" in specs) {
        kernel = "python2";
      } else {
        const specList = Object.keys(specs);
        specList.sort();
        kernel = specList[0];
      }

      launchNewNotebook(specs[kernel]);
    });
  } else {
    notebooks.forEach(f => {
      try {
        launch(resolve(f));
      } catch (e) {
        log.error(e);
        console.error(e);
      }
    });
  }
  buffer.forEach(openFileFromEvent);
});

// All open file events after app is ready
openFile$.skipUntil(fullAppReady$).subscribe(openFileFromEvent);

fullAppReady$.subscribe(() => {
  kernelSpecsPromise
    .then(kernelSpecs => {
      if (Object.keys(kernelSpecs).length !== 0) {
        const menu = loadFullMenu(kernelSpecs);
        Menu.setApplicationMenu(menu);
      } else {
        dialog.showMessageBox(
          {
            type: "warning",
            title: "No Kernels Installed",
            buttons: [],
            message: "No kernels are installed on your system.",
            detail:
              "No kernels are installed on your system so you will not be " +
              "able to execute code cells in any language. You can read about " +
              "installing kernels at " +
              "https://ipython.readthedocs.io/en/latest/install/kernel_install.html"
          },
          index => {
            if (index === 0) {
              app.quit();
            }
          }
        );
      }
    })
    .catch(err => {
      dialog.showMessageBox(
        {
          type: "error",
          title: "No Kernels Installed",
          buttons: [],
          message: "No kernels are installed on your system.",
          detail:
            "No kernels are installed on your system so you will not be " +
            "able to execute code cells in any language. You can read about " +
            "installing kernels at " +
            "https://ipython.readthedocs.io/en/latest/install/kernel_install.html" +
            `\nFull error: ${err.message}`
        },
        index => {
          if (index === 0) {
            app.quit();
          }
        }
      );
    });
});
