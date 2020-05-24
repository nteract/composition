import { ElectronRoleCommand } from "../types";

export const Reload: ElectronRoleCommand = {
  name: "Reload",
  mapToElectronRole: "forcereload",
};

export const Fullscreen: ElectronRoleCommand = {
  name: "Fullscreen",
  mapToElectronRole: "togglefullscreen",
};

export const DevTools: ElectronRoleCommand = {
  name: "DevTools",
  mapToElectronRole: "toggledevtools",
};

export const ZoomReset: ElectronRoleCommand = {
  name: "ZoomReset",
  mapToElectronRole: "resetzoom",
};

export const ZoomIn: ElectronRoleCommand = {
  name: "ZoomIn",
  mapToElectronRole: "zoomin",
};

export const ZoomOut: ElectronRoleCommand = {
  name: "ZoomOut",
  mapToElectronRole: "zoomout",
};
