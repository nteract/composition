import { autoUpdater } from "electron-updater";

export function initAutoUpdater() {
  const log = require("electron-log");
  log.transports.file.level = "info";
  autoUpdater.logger = log;
  autoUpdater.checkForUpdatesAndNotify();
}
