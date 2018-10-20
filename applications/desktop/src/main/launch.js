/* @flow strict */
import * as path from "path";

import { Menu, shell, BrowserWindow } from "electron";

import { loadFullMenu } from "./menu";

let launchIpynb;

export function getPath(url: string) {
  const nUrl = url.substring(url.indexOf("static"));
  return path.join(__dirname, "..", "..", nUrl.replace("static/", ""));
}

// Given a URL from any browser window, determine whether to launch
// a notebook or open an external URL
export function deferURL(event: Event, url: string) {
  event.preventDefault();
  if (!url.startsWith("file:")) {
    shell.openExternal(url);
  } else if (url.endsWith(".ipynb")) {
    launchIpynb(getPath(url));
  }
}

const iconPath = path.join(__dirname, "..", "static", "icon.png");

const initContextMenu = require("electron-context-menu");

// Setup right-click context menu for all BrowserWindows
initContextMenu();

export function launch(filename: ?string) {
  const win = new BrowserWindow({
    width: 800,
    height: 1000,
    icon: iconPath,
    title: "nteract",
    show: false
  });

  win.once("ready-to-show", () => {
    win.show();
  });
  const index = path.join(__dirname, "..", "static", "index.html");
  win.loadURL(`file://${index}`);

  win.webContents.on("did-finish-load", () => {
    const menu = loadFullMenu();
    Menu.setApplicationMenu(menu);
    if (filename != null) {
      win.webContents.send("main:load", filename);
    }
    win.webContents.send("main:load-config");
  });

  win.webContents.on("will-navigate", deferURL);

  win.on("focus", () => {
    const menu = loadFullMenu();
    Menu.setApplicationMenu(menu);
  });

  win.on("show", () => {
    const menu = loadFullMenu();
    Menu.setApplicationMenu(menu);
  });

  // Emitted when the window is closed.
  win.on("closed", () => {
    const menu = loadFullMenu();
    Menu.setApplicationMenu(menu);
  });
  return win;
}
launchIpynb = launch;

export function launchNewNotebook(kernelSpec: KernelSpec) {
  const win = launch();
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("main:new", kernelSpec);
  });
  return win;
}
