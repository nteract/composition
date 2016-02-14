// This gets bootstrapped by main.js
import app from 'app';
import BrowserWindow from 'browser-window';
import { setApplicationMenu, DEFAULT_MENU } from './src/menu';

import path from 'path';

let windows = [];

app.on('window-all-closed', () => {
  // On OS X, we want to keep the app and menu bar active
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// First two arguments are Electron and main.js
// We'll assume the rest are the notebooks to be opened
const notebooks = process.argv.slice(2);
if(notebooks <= 0) {
  // default to the intro notebook for now
  notebooks.push('intro.ipynb');
}

app.on('ready', () => {
  setApplicationMenu(DEFAULT_MENU);
  windows = notebooks.forEach((notebook) => {
    let win = new BrowserWindow({
      width: 800,
      height: 1000,
      // frame: false,
      darkTheme: true,
      title: 'nteract',
    });

    const index = path.join(__dirname, '/index.html');

    win.loadURL(`file://${index}#${encodeURIComponent(notebook)}`);
    // Emitted when the window is closed.
    win.on('closed', () => {
      win = null;
    });
    return win;
  });
});
