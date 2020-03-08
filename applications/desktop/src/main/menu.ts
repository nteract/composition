import { manifest as examplesManifest } from "@nteract/examples";
import { app, BrowserWindow, Menu, MenuItemConstructorOptions, shell } from "electron";
import sortBy from "lodash.sortby";
import * as path from "path";
import { Store } from "redux";
import { appName } from "../common/appname";
import { Command, MenuDefinition, SubmenuOptions } from "../common/commands/types";
import { menu, tray } from "../common/menu";
import { MainAction, MainStateRecord } from "./reducers";

// Pasting cells will also paste text, so we need to intercept the event with
// a global shortcut and then only trigger the IPC call.
/*
function interceptAcceleratorAndForceOnlyMenuAction(
  command: string,
): void {
  globalShortcut.register((accelerators as any)[command], () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send(`command:${command}`);
    }
  });
}

interceptAcceleratorAndForceOnlyMenuAction("PasteCell");
*/

app.setName(appName);

const examplesBaseDir = path
  .join(__dirname, "..", "node_modules", "@nteract/examples")
  .replace("app.asar", "app.asar.unpacked");

function buildMenuTemplate(
  store: Store<MainStateRecord, MainAction>,
  structure: MenuDefinition,
) {
  const collections = {
    kernelspec: sortBy(store.getState().kernelSpecs ?? {}, "spec.display_name"),
    example: examplesManifest,
  };

  const build = {
    separator: () => ({
      type: "separator" as "separator",
    }),

    url: (label: string, url: string) => ({
      label,
      click: () => shell.openExternal(url),
    }),

    command: (label: string, options: {}, command: Command) => ({
      label,
      click: () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
          focusedWindow.webContents.send(`command:${command.name}`);
        }
      },
    }),

    submenu: (label: string, options: SubmenuOptions, sub: MenuDefinition) => ({
      type: "submenu" as "submenu",
      label,
      submenu: Array.from(buildItems(sub)),
    }),
  };

  function* buildItems(
    submenu: MenuDefinition,
  ): Generator<MenuItemConstructorOptions> {
    for (const item of submenu) {
      if (Array.isArray(item)) {
        if (item.length === 0) {
          yield build.separator();
        } else if (Array.isArray(item[item.length - 1])) {
          if (item.length === 2) {
            yield build.submenu(item[0], {}, item[1] as MenuDefinition);
          } else {
            yield build.submenu(...item as [string, {}, MenuDefinition]);
          }
        } else if (typeof item[1] === "string") {
          yield build.url(...item as [string, string])
        } else {
          if (item.length === 2) {
            yield build.command(item[0], {}, item[1] as Command);
          } else {
            yield build.command(item[0], item[2], item[1] as Command);
          }
        }
      } else {
        yield* buildItems(
          (collections[item.forEach] as any).map(item.create)
        );
      }
    }
  }

  return Array.from(buildItems(structure));
}

export function loadFullMenu() {
  const template = buildMenuTemplate(global.store, menu);
  console.log("menu", template);
  return Menu.buildFromTemplate(template);
}

export function loadTrayMenu() {
  const template = buildMenuTemplate(global.store, tray);
  console.log("tray", template);
  return Menu.buildFromTemplate(template);
}
