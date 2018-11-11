/* @flow strict */
import { autoUpdater } from "electron-updater";

export function initAutoUpdater() {
  if (process.env.NTERACT_DESKTOP_DISABLE_AUTO_UPDATE !== "1") {
    const log = require("electron-log");
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}
