import { Menu, dialog, app, ipcMain as ipc } from 'electron';
import { resolve } from 'path';

import Rx from 'rxjs/Rx';

import {
  launch,
  launchNewNotebook,
} from './launch';

import { defaultMenu, loadFullMenu } from './menu';

const log = require('electron-log');
const kernelspecs = require('kernelspecs');

const kernelSpecsPromise = kernelspecs.findAll();

const parseCommandLine = require('./parse-command-line');

console.log(process.argv);
const args = parseCommandLine(process.argv.slice(1));

function addPathToOpen(evt, pathToOpen) {
  evt.preventDefault();
  args.pathsToOpen.push(pathToOpen);
}

function addURLToOpen(evt, urlToOpen) {
  event.preventDefault();
  args.urlsToOpen.push(urlToOpen);
}

app.on('open-file', addPathToOpen);
app.on('open-url', addURLToOpen);

function showNoKernelsDialog(err) {
  const errorDetail = err ? `\nFull error: ${err.message}` : '';
  dialog.showMessageBox({
    type: 'error',
    title: 'No Kernels Installed',
    buttons: [],
    message: 'No kernels are installed on your system.',
    detail: `No kernels are installed on your system so you will not be able to execute code cells in any language. You can read about installing kernels at https://ipython.readthedocs.io/en/latest/install/kernel_install.html

    ${errorDetail}`,
  }, () => {
    app.quit();
  });
}

function launchEmptyNotebook(specs) {
  console.log(specs);
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

function start(processedArgs) {
  kernelSpecsPromise.then(kernelSpecs => {
    if (Object.keys(kernelSpecs).length !== 0) {
      // Get the default menu first
      Menu.setApplicationMenu(defaultMenu);
      // Let the kernels/languages come in after
      loadFullMenu().then(menu => Menu.setApplicationMenu(menu));
    } else {
      showNoKernelsDialog();
    }
    if (processedArgs.pathsToOpen.length <= 0) {
      kernelSpecsPromise.then(launchEmptyNotebook);
    } else {
      processedArgs.pathsToOpen
        .forEach(f => {
          try {
            console.error('wtf');
            launch(resolve(f));
          } catch (e) {
            log.error(e);
            console.error(e);
          }
        });
    }
  }).catch(err => showNoKernelsDialog(err));

  app.on('open-file', (evt, file) => {
    launch(resolve(f));
  });
}

app.on('ready', () => {
  app.removeListener('open-file', addPathToOpen);
  app.removeListener('open-url', addURLToOpen);
  start(args);
});

app.on('window-all-closed', () => {
  // On OS X, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipc.on('new-kernel', (event, newKernel) => {
  launchNewNotebook(newKernel);
});

ipc.on('open-notebook', (event, filename) => {
  launch(resolve(filename));
});
