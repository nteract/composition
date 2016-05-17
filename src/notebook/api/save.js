import * as path from 'path';

const electron = require('electron');
const { remote } = electron;

const remoteElectron = remote.require('electron');
const dialog = remoteElectron.dialog;

export function showSaveAsDialog(defaultPath) {
  return new Promise((resolve) => {
    const filename = dialog.showSaveDialog({
      title: 'Save Notebook',
      defaultPath,
      filters: [{ name: 'Notebooks', extensions: ['ipynb'] }],
    });

    if (filename && path.extname(filename) === '') {
      resolve(`${filename}.ipynb`);
    }
    resolve(filename);
  });
}
