import path from "path";

import { shell, BrowserWindow, dialog } from "electron";

let launchIpynb;

export function getPath(url) {
  const nUrl = url.substring(url.indexOf("static"), path.length);
  return path.join(__dirname, "..", "..", nUrl.replace("static/", ""));
}

export function deferURL(event, url) {
  event.preventDefault();
  if (!url.startsWith("file:")) {
    shell.openExternal(url);
  } else if (url.endsWith(".ipynb")) {
    launchIpynb(getPath(url));
  }
}

const iconPath = path.join(__dirname, "..", "..", "static", "icon.png");

const initContextMenu = require("electron-context-menu");

// Setup right-click context menu for all BrowserWindows
initContextMenu();

export function launch(filename) {
  let win = new BrowserWindow({
    width: 800,
    height: 1000,
    icon: iconPath,
    title: "nteract"
  });

  const index = path.join(__dirname, "..", "..", "static", "index.html");
  win.loadURL(`file://${index}`);

  let actuallyExit = false;

  win.on("close", e => {
    if (!actuallyExit) {
      e.preventDefault();
      dialog.showMessageBox(
        {
          type: "question",
          buttons: ["Yes", "No"],
          title: "Confirm",
          message: "Unsaved data will be lost. Are you sure you want to quit?"
        },
        function(response) {
          if (response === 0) {
            e.returnValue = false;
            actuallyExit = true;
            win.close();
          }
        }
      );
    }
  });

  win.webContents.on("did-finish-load", () => {
    if (filename) {
      win.webContents.send("main:load", filename);
    }
    win.webContents.send("main:load-config");
  });

  win.webContents.on("will-navigate", deferURL);

  // Emitted when the window is closed.
  win.on("closed", () => {
    win = null;
  });
  return win;
}
launchIpynb = launch;

export function launchNewNotebook(kernelSpec) {
  const win = launch();
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("main:new", kernelSpec);
  });
  return win;
}
