/* @flow strict */
import {
  Menu,
  dialog,
  app,
  ipcMain as ipc,
  BrowserWindow,
  Tray
} from "electron";
import { resolve, join } from "path";
import { existsSync } from "fs";

import { Subscriber, fromEvent, forkJoin, zip } from "rxjs";
import {
  mergeMap,
  takeUntil,
  skipUntil,
  buffer,
  catchError,
  first
} from "rxjs/operators";

import {
  mkdirpObservable,
  readFileObservable,
  writeFileObservable
} from "fs-observable";

import { launch, launchNewNotebook } from "./launch";
import { initAutoUpdater } from "./auto-updater.js";

import { loadFullMenu, loadTrayMenu } from "./menu";

import prepareEnv from "./prepare-env";
import initializeKernelSpecs from "./kernel-specs";
import { setKernelSpecs } from "./actions";

import configureStore from "./store";

const store = configureStore();
// HACK: The main process store should not be stored in a global.
global.store = store;

const log = require("electron-log");

const kernelspecs = require("kernelspecs");
const jupyterPaths = require("jupyter-paths");
const path = require("path");

const yargs = require("yargs/yargs");

type Arguments = {
  /**
   * Actual string arguments
   */
  _: Array<string>,
  /**
   * Kernel selected by user, defaults to python3
   */
  kernel: string,
  /**
   * Version of the app
   */
  version: string
};

const argv: Arguments = yargs()
  .version((() => require("./../../package.json").version)())
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

const notebooks = argv._.filter(x => /(.ipynb)$/.test(x)).filter(x =>
  existsSync(resolve(x))
);

ipc.on("new-kernel", (event, k) => {
  launchNewNotebook(k);
});

ipc.on("open-notebook", (event, filename) => {
  launch(resolve(filename));
});

app.on("ready", initAutoUpdater);

const electronReady$ = fromEvent(app, "ready");
const windowReady$ = fromEvent(ipc, "react-ready");

const fullAppReady$ = zip(electronReady$, prepareEnv).pipe(first());

const jupyterConfigDir = path.join(app.getPath("home"), ".jupyter");
const nteractConfigFilename = path.join(jupyterConfigDir, "nteract.json");

const prepJupyterObservable = prepareEnv.pipe(
  mergeMap(() =>
    // Create all the directories we need in parallel
    forkJoin(
      // Ensure the runtime Dir is setup for kernels
      mkdirpObservable(jupyterPaths.runtimeDir()),
      // Ensure the config directory is all set up
      mkdirpObservable(jupyterConfigDir)
    )
  ),
  // Set up our configuration file
  mergeMap(() =>
    readFileObservable(nteractConfigFilename).pipe(
      catchError(err => {
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
    )
  )
);

const kernelSpecsPromise = prepJupyterObservable
  .toPromise()
  .then(() => kernelspecs.findAll())
  .then(specs => {
    return initializeKernelSpecs(specs);
  });

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

      const index = join(__dirname, "..", "static", "splash.html");
      win.loadURL(`file://${index}`);
      win.once("ready-to-show", () => {
        win.show();
      });
    },
    err => {
      console.error(err);
    },
    () => {
      // Close the splash page when completed
      if (win) {
        win.close();
      }
    }
  );
}

const appAndKernelSpecsReady = zip(
  fullAppReady$,
  windowReady$,
  kernelSpecsPromise
);

electronReady$
  .pipe(takeUntil(appAndKernelSpecsReady))
  .subscribe(createSplashSubscriber());

function closeAppOnNonDarwin() {
  // On macOS, we want to keep the app and menu bar active
  if (process.platform !== "darwin") {
    app.quit();
  }
}
const windowAllClosed = fromEvent(app, "window-all-closed");
windowAllClosed
  .pipe(skipUntil(appAndKernelSpecsReady))
  .subscribe(closeAppOnNonDarwin);

const openFile$ = fromEvent(app, "open-file", (event, filename) => ({
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
openFile$
  .pipe(
    buffer(fullAppReady$),
    first()
  )
  .subscribe(buffer => {
    // Form an array of open-file events from before app-ready // Should only be the first
    // Now we can choose whether to open the default notebook
    // based on if arguments went through argv or through open-file events
    if (notebooks.length <= 0 && buffer.length <= 0) {
      log.info("launching an empty notebook by default");
      kernelSpecsPromise.then((specs: KernelSpecs) => {
        let kernel: string;

        if (argv.kernel in specs) {
          kernel = argv.kernel;
        } else if ("python2" in specs) {
          kernel = "python2";
        } else {
          const specList = Object.keys(specs);
          specList.sort();
          kernel = specList[0];
        }
        if (kernel && specs[kernel]) {
          launchNewNotebook(specs[kernel]);
        }
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
openFile$.pipe(skipUntil(fullAppReady$)).subscribe(openFileFromEvent);
let tray = null;
fullAppReady$.subscribe(() => {
  kernelSpecsPromise
    .then(kernelSpecs => {
      if (Object.keys(kernelSpecs).length !== 0) {
        store.dispatch(setKernelSpecs(kernelSpecs));
        const menu = loadFullMenu();
        Menu.setApplicationMenu(menu);
        const logo =
          process.platform === "win32" ? "logoWhite" : "logoTemplate";
        const trayImage = join(__dirname, "..", "static", `${logo}.png`);
        tray = new Tray(trayImage);
        const trayMenu = loadTrayMenu();
        tray.setContextMenu(trayMenu);
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
