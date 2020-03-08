import { ElectronRoleCommand } from "../types";

export const Minimize: ElectronRoleCommand = {
  name: "Minimize",
  mapToElectronRole: "hide",
};

export const Close: ElectronRoleCommand = {
  name: "Close",
  mapToElectronRole: "close",
};

export const BringAllToFront: ElectronRoleCommand = {
  name: "BringAllToFront",
  mapToElectronRole: "front",
};
