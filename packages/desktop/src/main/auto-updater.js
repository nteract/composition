import { autoUpdater } from "electron-updater";

export function initAutoUpdater() {
  // Autoupdate should only get called on macOS and Windows
  if (process.platform === "darwin" || process.platform === "win32") {
    const log = require("electron-log");
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}
