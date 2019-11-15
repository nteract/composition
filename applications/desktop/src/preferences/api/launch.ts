import { remote } from "electron";
import * as path from "path";

const iconPath = path.join(__dirname, "..", "static", "icon.png");

export function launch(): void {
  const win = new remote.BrowserWindow({
    height: 600,
    icon: iconPath,
    show: false,
    title: "nteract: Preferences",
    webPreferences: { nodeIntegration: true },
    width: 800,
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  const index = path.join(__dirname, "..", "static", "preferences.html");
  win.loadURL(`file://${index}`);

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("main:load-config");
  });

  const noMenu = () => remote.Menu.setApplicationMenu(null);

  win.on("focus", noMenu);
  win.on("show", noMenu);
  win.on("closed", noMenu);
}
