import { ElectronRoleCommand } from "../types";

export const About: ElectronRoleCommand = {
  name: "About",
  mapToElectronRole: "about",
};

export const Hide: ElectronRoleCommand = {
  name: "Hide",
  mapToElectronRole: "hide",
};

export const HideOthers: ElectronRoleCommand = {
  name: "HideOthers",
  mapToElectronRole: "hideOthers",
};

export const Unhide: ElectronRoleCommand = {
  name: "Unhide",
  mapToElectronRole: "unhide",
};

export const Quit: ElectronRoleCommand = {
  name: "Quit",
  mapToElectronRole: "quit",
};
