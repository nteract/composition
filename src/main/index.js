import { Menu, dialog, app, ipcMain as ipc, BrowserWindow } from 'electron';
import { resolve } from 'path';

import Rx from 'rxjs/Rx';

import {
  launch,
  launchNewNotebook,
} from './launch';

import { defaultMenu, loadFullMenu } from './menu';

import prepareEnv from './prepare-env';

const path = require('path');

const log = require('electron-log');

const kernelspecs = require('kernelspecs');

const version = require('../../package.json').version;

log.info('args', process.argv);

const sliceAt = process.argv[0].match('nteract') ? 1 : 2;

const argv = require('yargs')
  .version(version)
  .parse(process.argv.slice(sliceAt));

const notebooks = argv._
  .filter(Boolean)
  .filter(x => /^(?!-psn)/.test(x)) // Ignore strangeness on OS X first launch
                                 // see #805
  .filter(x => x !== '.'); // Ignore the `electron .`
                           // TODO: Consider opening something for directories

ipc.on('new-kernel', (event, newKernel) => {
  launchNewNotebook(newKernel);
});

ipc.on('open-notebook', (event, filename) => {
  launch(path.resolve(filename));
});

const electronReady$ = Rx.Observable.fromEvent(app, 'ready');
const webContentsReady$ = Rx.Observable.fromEvent(
  app,
  'web-contents-created',
  (event, webContents) => ({ event, webContents }));

const fullAppReady$ = Rx.Observable.zip(
  electronReady$,
  prepareEnv
).first();

const kernelSpecsPromise = prepareEnv
  .toPromise()
  .then(() => kernelspecs.findAll());

/**
 * Creates an Rx.Subscriber that will create a splash page onNext and close the
 * splash page onComplete.
 * @return {Rx.Subscriber} Splash Window subscriber
 */
export function createSplashSubscriber() {
  let win;

  return Rx.Subscriber.create(() => {
    win = new BrowserWindow({
      width: 900,
      height: 400,
      title: 'loading',
      frame: false,
    });

    const index = path.join(__dirname, '..', '..', 'static', 'splash.html');
    win.loadURL(`file://${index}`);
    win.show();
  }, null,
  () => {
    // Close the splash page when completed
    if (win) {
      win.close();
    }
  });
}

const appAndKernelSpecsReady = Rx.Observable.zip(fullAppReady$, kernelSpecsPromise);

const splashSubscription = electronReady$
  // TODO: Take until first window is shown
  .takeUntil(appAndKernelSpecsReady)
  .subscribe(createSplashSubscriber());

function closeAppOnNonDarwin() {
  // On OS X, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
}
const windowAllClosed = Rx.Observable.fromEvent(app, 'window-all-closed');
const windowClosedSubscription = windowAllClosed
  .skipUntil(appAndKernelSpecsReady)
  .subscribe(closeAppOnNonDarwin);

const openFile$ = Rx.Observable.fromEvent(
  app,
  'open-file', (event, filename) => ({ event, filename })
);

function openFileFromEvent({ event, filename }) {
  event.preventDefault();
  launch(path.resolve(filename));
}


// Since we can't launch until app is ready
// and OS X will send the open-file events early,
// buffer those that come early.
openFile$
  .buffer(fullAppReady$) // Form an array of open-file events from before app-ready
  .first() // Should only be the first
  .subscribe(buffer => {
    // Now we can choose whether to open the default notebook
    // based on if arguments went through argv or through open-file events
    if (notebooks.length <= 0 && buffer.length <= 0) {
      log.info('launching an empty notebook by default');
      kernelSpecsPromise.then(specs => {
        const defaultKernel = 'python3';
        let kernel = defaultKernel;

        if ('python3' in specs) {
          kernel = 'python3';
        } else if ('python2' in specs) {
          kernel = 'python2';
        } else {
          const specList = Object.keys(specs);
          specList.sort();
          kernel = specList[0];
        }

        launchNewNotebook(kernel);
      }
      );
    } else {
      notebooks
        .forEach(f => {
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
openFile$
  .skipUntil(fullAppReady$)
  .subscribe(openFileFromEvent);

fullAppReady$
  .subscribe(() => {
    kernelSpecsPromise.then(kernelSpecs => {
      if (Object.keys(kernelSpecs).length !== 0) {
        // Get the default menu first
        Menu.setApplicationMenu(defaultMenu);
        // Let the kernels/languages come in after
        loadFullMenu().then(menu => Menu.setApplicationMenu(menu));
      } else {
        dialog.showMessageBox({
          type: 'warning',
          title: 'No Kernels Installed',
          buttons: [],
          message: 'No kernels are installed on your system.',
          detail: 'No kernels are installed on your system so you will not be ' +
            'able to execute code cells in any language. You can read about ' +
            'installing kernels at ' +
            'https://ipython.readthedocs.io/en/latest/install/kernel_install.html',
        }, (index) => {
          if (index === 0) {
            app.quit();
          }
        });
      }
    }).catch(err => {
      dialog.showMessageBox({
        type: 'error',
        title: 'No Kernels Installed',
        buttons: [],
        message: 'No kernels are installed on your system.',
        detail: 'No kernels are installed on your system so you will not be ' +
          'able to execute code cells in any language. You can read about ' +
          'installing kernels at ' +
          'https://ipython.readthedocs.io/en/latest/install/kernel_install.html' +
          `\nFull error: ${err.message}`,
      }, (index) => {
        if (index === 0) {
          app.quit();
        }
      });
    });
  });

webContentsReady$
  .subscribe((event, webContents) => {
    console.log('in webcontents ready');
    console.log(webContents);
    dialog.showMessageBox({
    type: 'question',
    buttons: ['It\'s OK to Track Me', 'Please Don\'t Track Me'],
    title: 'Allow Tracking?',
    message: 'Would you like to enable Google Analytics?',
    detail: 'We\'d like to enable tracking in this session of nteract. Why are ' +
      'we doing this? Tracking usage helps us get statistics for grant funding, ' +
      'the developement of localization features, and more. To read more about ' +
      'how we use this information, please visit ' +
      'https://github.com/nteract/nteract/blob/master/TRACKING.md.',
    }, (index) => {
      if (index === 0) {
        const analytics = path.join(__dirname, '..', '..', 'static', 'scripts', 'analytics.js');
        webContents.executeJavaScript(`require(${analytics})`);
      }
      return;
    });
  });
