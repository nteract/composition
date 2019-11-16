import { KernelspecInfo } from "@nteract/types";
import { BrowserWindow, ipcMain as ipc, Menu, shell } from "electron";
import initContextMenu from "electron-context-menu";
import * as path from "path";

import { loadFullMenu } from "./menu";

// Setup right-click context menu for all BrowserWindows
initContextMenu();

// Given a URL from any browser window, determine whether to launch
// a notebook or open an external URL
export function deferURL(event: Event, url: string): void {
  event.preventDefault();
  if (!url.startsWith("file:")) {
    shell.openExternal(url);
  } else if (url.endsWith(".ipynb")) {
    launchIpynb(url);
  }
}

const resourcePath = path.join(__dirname, "..", "static");
const iconPath = path.join(resourcePath, "icon.png");

function createWindow(
  index: string,
  makeMenu: () => any = () => null,
): BrowserWindow {
  const win = new BrowserWindow({
    width: 800,
    height: 1000,
    icon: iconPath,
    title: "nteract",
    show: false,
    webPreferences: { nodeIntegration: true }
  });

  const showMenu = () => Menu.setApplicationMenu(makeMenu());

  win.once("ready-to-show", () => win.show());
  win.loadURL(`file://${resourcePath}/${index}`);
  win.webContents.on("will-navigate", deferURL);
  win.webContents.on("did-finish-load", showMenu);
  win.on("focus", showMenu);
  win.on("show", showMenu);
  win.on("closed", showMenu);

  return win;
}

export function launchIpynb(
  filepath: string,
): BrowserWindow {
  const win = createWindow("index.html", loadFullMenu);
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("main:load", filepath);
    win.webContents.send("main:watch-config");
  });
  return win;
}

export function launchNewNotebook(
  filepath: string | null,
  kernelSpec: KernelspecInfo,
): BrowserWindow {
  const win = createWindow("index.html", loadFullMenu);
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("main:new", filepath, kernelSpec);
    win.webContents.send("main:watch-config");
  });
  return win;
}

export function launchPreferences(): BrowserWindow {
  const win = createWindow("preferences.html");
  return win;
}

ipc.on("main:open-config-window", launchPreferences);
