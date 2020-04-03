import { ConfigurationOption, createConfigOption, setConfigFile, transferConfigOptionFromRenderer } from "@nteract/mythic-configuration";
import { KernelspecInfo, Kernelspecs } from "@nteract/types";
import { app, BrowserWindow, dialog, Event, ipcMain as ipc, Menu, Tray } from "electron";
import initContextMenu from "electron-context-menu";
import * as log from "electron-log";
import { existsSync } from "fs";
import { mkdirpObservable } from "fs-observable";
import * as jupyterPaths from "jupyter-paths";
import * as kernelspecs from "kernelspecs";
import { join, resolve } from "path";
import { forkJoin, fromEvent, Observable, Subscriber, zip } from "rxjs";
import { buffer, first, mergeMap, skipUntil, takeUntil } from "rxjs/operators";
import yargs from "yargs/yargs";
import { QUITTING_STATE_NOT_STARTED, QUITTING_STATE_QUITTING, setKernelSpecs, setQuittingState } from "./actions";
import { initAutoUpdater } from "./auto-updater";
import { defaultKernel } from "./config-options";
import initializeKernelSpecs from "./kernel-specs";
import { launch, launchNewNotebook } from "./launch";
import { loadFullMenu, loadTrayMenu } from "./menu";
import prepareEnv from "./prepare-env";
import configureStore from "./store";

const store = configureStore(undefined);

// HACK: The main process store should not be stored in a global.
(global as any).store = store;

const argv = yargs()
  .version((() => require("./../../package.json").version)())
  .usage("Usage: nteract <notebooks> [options]")
  .example("nteract notebook1.ipynb notebook2.ipynb", "Open notebooks")
  .example("nteract --kernel javascript", "Launch a kernel")
  .describe("kernel", "Launch a kernel")
  .alias("k", "kernel")
  .alias("v", "version")
  .alias("h", "help")
  .describe("verbose", "Display debug information")
  .help("help")
  .parse(process.argv.slice(1));

log.info("args", argv);

const notebooks = argv._.filter(x => /(.ipynb)$/.test(x));

ipc.on("transfer-config-options-to-main",
  (_event: any, options: ConfigurationOption[]) => {
    options.forEach(each => transferConfigOptionFromRenderer(each));
  });

ipc.on("new-kernel", (_event: any, k: KernelspecInfo) => {
  launchNewNotebook(null, k);
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

store.dispatch(setConfigFile(nteractConfigFilename));

const prepJupyterObservable = prepareEnv.pipe(
  mergeMap(() =>
    // Create all the directories we need in parallel
    forkJoin(
      // Ensure the runtime Dir is setup for kernels
      mkdirpObservable(jupyterPaths.runtimeDir()),
      // The config directory is taken care of by the configuration myths
    )
  ),
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
    // `win.close()` teardown is async, so `isVisible` is more reliable, see #3656
    windows.filter(win => win.isVisible()).length > 0 &&
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
  .pipe(buffer(fullAppReady$), first())
  .subscribe((buffer: Array<{ filename: string; event: Event }>) => {
    // Form an array of open-file events from before app-ready // Should only be the first
    // Now we can choose whether to open the default notebook
    // based on if arguments went through argv or through open-file events

    const cliLaunchNewNotebook = (filepath: string | null) => {
      kernelSpecsPromise.then((specs: Kernelspecs) => {
        let kernel: string = defaultKernel(store.getState());
        const passedKernel = argv.kernel as string;

        if (passedKernel && passedKernel in specs) {
          kernel = passedKernel;
        } else if (!kernel && !(kernel in specs)) {
          const specList = Object.keys(specs);
          specList.sort();
          kernel = specList[0];
        }

        if (kernel && specs[kernel]) {
          launchNewNotebook(filepath, specs[kernel]);
        }
      });
    };

    if (notebooks.length <= 0 && buffer.length <= 0) {
      log.info("launching an empty notebook by default");
      cliLaunchNewNotebook(null);
    } else {
      notebooks.forEach(f => {
        if (existsSync(resolve(f))) {
          try {
            launch(resolve(f));
          } catch (e) {
            log.error(e);
            console.error(e);
          }
        } else {
          log.info(`notebook ${f} not found, launching as empty notebook`);
          cliLaunchNewNotebook(f);
        }
      });
    }
    buffer.forEach(openFileFromEvent);
  });

// All open file events after app is ready
openFile$.pipe(skipUntil(fullAppReady$)).subscribe(openFileFromEvent);
let tray = null;
fullAppReady$.subscribe(() => {
  // Setup right-click context menu for all BrowserWindows
  initContextMenu();
  
  kernelSpecsPromise
    .then(kernelSpecs => {
      if (Object.keys(kernelSpecs).length !== 0) {
        store.dispatch(setKernelSpecs(kernelSpecs));
      }
      const menu = loadFullMenu();
      Menu.setApplicationMenu(menu);
      const logo = process.platform === "win32" ? "logoWhite" : "logoTemplate";
      const trayImage = join(__dirname, "..", "static", `${logo}.png`);
      tray = new Tray(trayImage);
      const trayMenu = loadTrayMenu();
      tray.setContextMenu(trayMenu);
    })
    .catch(err => {
      console.error("Unexpected error when fetching kernelspecs: ", err);
    });
});
