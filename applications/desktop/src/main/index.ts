import * as log from "electron-log";
import { existsSync } from "fs";
import * as jupyterPaths from "jupyter-paths";
import * as kernelspecs from "kernelspecs";
import { join, resolve } from "path";
import yargs from "yargs/yargs";

import { KernelspecInfo, Kernelspecs } from "@nteract/types";

import {
  app,
  BrowserWindow,
  dialog,
  Event,
  ipcMain as ipc,
  Menu,
  Tray
} from "electron";
import {
  mkdirpObservable,
  readFileObservable,
  writeFileObservable
} from "fs-observable";
import { forkJoin, fromEvent, Observable, Subscriber, zip } from "rxjs";
import {
  buffer,
  catchError,
  first,
  mergeMap,
  reduce,
  skipUntil,
  takeUntil,
  tap
} from "rxjs/operators";

import {
  QUITTING_STATE_NOT_STARTED,
  QUITTING_STATE_QUITTING,
  setKernelSpecs,
  setQuittingState,
  setRunningKernels
} from "./actions";
import { initAutoUpdater } from "./auto-updater";
import initializeKernelSpecs from "./kernel-specs";
import { runningKernelsObservable } from "./kernels";
import { launch, launchNewNotebook } from "./launch";
import { loadFullMenu, loadTrayMenu } from "./menu";
import prepareEnv from "./prepare-env";

import configureStore from "./store";

const store = configureStore();

// HACK: The main process store should not be stored in a global.
(global as any).store = store;

const argv = yargs()
  .usage(
    "Usage: nteract <notebooks> [options]"
  )
  .options({
    existing: {
      desc:     "Connect to an existing kernel",
    },
    help:     {
      alias:    "h",
      desc:     "Display usage and exit",
    },
    kernel:   {
      alias:    "k",
      default:  "python3",
      desc:     "Launch a kernel",
    },
    verbose:  {
      desc:     "Display debug information",
    },
    version:  {
      alias:    "v",
      desc:     "Display version and exit",
    },
  })
  .example(
    "nteract notebook1.ipynb notebook2.ipynb", "Open notebooks"
  )
  .example(
    "nteract --kernel javascript", "Launch a kernel"
  )
  .example(
    "nteract --existing kernel-1234.json", "Connect to an existing kernel"
  )
  .version("version", (() => require("./../../package.json").version)())
  .help("help")
  .parse(process.argv.slice(1));

log.info("args", argv);

const notebooks = argv._.filter(x => /(.ipynb)$/.test(x)).filter(x =>
  existsSync(resolve(x))
);

ipc.on("new-kernel", (_event: any, k: KernelspecInfo) => {
  launchNewNotebook(k);
});

ipc.on("open-notebook", (_event: any, filename: string) => {
  launch(resolve(filename));
});

ipc.on("reload", (event: Event) => {
  event.sender.reload();
  event.returnValue = null;
});

ipc.on("show-message-box", (event: Event, arg: any) => {
  const response = dialog.showMessageBox(arg);
  event.sender.send("show-message-box-response", response);
});

app.on("ready", initAutoUpdater);

const electronReady$ = new Observable(observer => {
  app.on("ready", (event: Event) => observer.next(event));
});
const windowReady$ = fromEvent(ipc, "react-ready");

const fullAppReady$ = zip(electronReady$, prepareEnv).pipe(first());

const jupyterConfigDir = join(app.getPath("home"), ".jupyter");
const nteractConfigFilename = join(jupyterConfigDir, "nteract.json");

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
  mergeMap(() =>
    forkJoin(
      // Set up our configuration file
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
      ),
      // Fetch the running kernels
      runningKernelsObservable().pipe(
        reduce((acc, value) => [...acc, value], []),
        tap(x => store.dispatch(setRunningKernels(x))),
      ),
    )
  )
);

const kernelSpecsPromise = prepJupyterObservable
  .toPromise()
  .then(() => kernelspecs.findAll())
  .then((specs: Kernelspecs) => {
    return initializeKernelSpecs(specs);
  });

/**
 * Creates an Rx.Subscriber that will create a splash page onNext and close the
 * splash page onComplete.
 * @return {Rx.Subscriber} Splash Window subscriber
 */
export function createSplashSubscriber() {
  let win: BrowserWindow;

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

app.on("before-quit", e => {
  // We use Electron's before-quit to give us a hook to into full app quit events,
  // such as Command+Q on macOS.

  // This is broken on Windows due to a bug in Electron; see #3549.
  // For most Windows workflows the user will be closing individual notebook windows directly,
  // so we just avoid this code path for now.
  if (process.platform === "win32") {
    return;
  }

  const windows = BrowserWindow.getAllWindows();
  if (
    windows.length > 0 &&
    store.getState().get("quittingState") === QUITTING_STATE_NOT_STARTED
  ) {
    e.preventDefault();
    store.dispatch(setQuittingState(QUITTING_STATE_QUITTING));

    // Trigger each windows' closeNotebookEpic. If and when all windows are closed,
    // the window-all-closed event will fire and we will complete the quit action.
    windows.forEach(win => win.close());
  }
});

const windowAllClosed = new Observable(observer => {
  app.on("window-all-closed", (event: Event) => observer.next(event));
});

windowAllClosed.pipe(skipUntil(appAndKernelSpecsReady)).subscribe(() => {
  // On macOS:
  // - If user manually closed the last window, we want to keep the app and
  //   menu bar active.
  // - If the window was closed programmatically as part of a quit, and not
  //   canceled during notebook shutdown, then we proceed w/ the quit.
  // All other platforms:
  // - Quit when last window closed.
  if (
    process.platform !== "darwin" ||
    store.getState().get("quittingState") === QUITTING_STATE_QUITTING
  ) {
    app.quit();
  }
});

ipc.on("close-notebook-canceled", () => {
  // User canceled, so interpret that as cancelling any in-flight app-wide quit
  store.dispatch(setQuittingState(QUITTING_STATE_NOT_STARTED));
});

const openFile$ = new Observable(
  (observer: Subscriber<{ filename: string; event: Event }>) => {
    const eventName = "open-file";

    const handler = (event: Event, filename: string) => {
      observer.next({
        event,
        filename
      });
    };
    app.on(eventName, handler);

    return () => app.removeListener(eventName, handler);
  }
);

function openFileFromEvent({
  event,
  filename
}: {
  event: Event;
  filename: string;
}) {
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
  .subscribe((buffer: Array<{ filename: string; event: Event }>) => {
    // Form an array of open-file events from before app-ready // Should only be the first
    // Now we can choose whether to open the default notebook
    // based on if arguments went through argv or through open-file events
    if (notebooks.length <= 0 && buffer.length <= 0) {
      log.info("launching an empty notebook by default");
      kernelSpecsPromise.then((specs: Kernelspecs) => {
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
