import { ElectronRoleCommand } from "../types";

export const Reload: ElectronRoleCommand = {
  name: "Reload",
  mapToElectronRole: "forceReload",
};

export const Fullscreen: ElectronRoleCommand = {
  name: "Fullscreen",
  mapToElectronRole: "togglefullscreen",
};

export const DevTools: ElectronRoleCommand = {
  name: "DevTools",
  mapToElectronRole: "toggleDevTools",
};

export const ZoomReset: ElectronRoleCommand = {
  name: "ZoomReset",
  mapToElectronRole: "resetZoom",
};

export const ZoomIn: ElectronRoleCommand = {
  name: "ZoomIn",
  mapToElectronRole: "zoomIn",
};

export const ZoomOut: ElectronRoleCommand = {
  name: "ZoomOut",
  mapToElectronRole: "zoomOut",
};
