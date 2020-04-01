import { manifest as examplesManifest } from "@nteract/examples";
import { allConfigOptions, HasPrivateConfigurationState } from "@nteract/mythic-configuration";
import { app, BrowserWindow, globalShortcut, Menu, MenuItemConstructorOptions, shell } from "electron";
import sortBy from "lodash.sortby";
import { Store } from "redux";
import { accelerators } from "../common/accelerators";
import { appName } from "../common/appname";
import { dispatchCommandInMain } from "../common/commands/dispatch";
import { ActionCommand, Command, MenuDefinition, MenuitemOptions, Platform, SubmenuOptions } from "../common/commands/types";
import { menu, tray } from "../common/menu";
import { customAccelerators } from "./config-options";
import { MainAction, MainStateRecord } from "./reducers";

const interceptAcceleratorEarly =
  (accelerator: string, command: ActionCommand<any, any>, props: any) =>
    globalShortcut.register(
      accelerator, () => dispatchCommandInMain(command, props)
    );

const acceleratorFor = (
  state: HasPrivateConfigurationState,
  command: Command,
  options: MenuitemOptions,
) => {
  const customs = customAccelerators(state);
  const data: any = customs[command.name] ?? accelerators[command.name];

  if (data === undefined) {
    return undefined;
  }

  if (typeof data === "string") {
    return data;
  }

  const interceptEarly = data.interceptEarly;
  let accelerator = null;

  if (data[process.platform] === undefined) {
    if (data.others === undefined) {
      return undefined;
    }
    accelerator = data.others;
  }
  else {
    accelerator = data[process.platform];
  }

  if (interceptEarly && !("mapToElectronRole" in command)) {
    interceptAcceleratorEarly(accelerator, command, options.props);
  }

  return accelerator;
};

const processString = (str: string) =>
  str.replace("<<version>>", app.getVersion());

const matchesPlatform = ({ platform }: { platform?: Platform }) =>
  platform === undefined ||
  (platform.charAt(0) !== "!" && platform === process.platform) ||
  (platform.charAt(0) === "!" && platform !== `!${process.platform}`);

const isEnabled = <PROPS>(command: ActionCommand<any, PROPS>) =>
  (command.props as any)?.contentRef !== "required"
  || !!BrowserWindow.getFocusedWindow();

function buildMenuTemplate(
  store: Store<MainStateRecord, MainAction>,
  structure: MenuDefinition,
) {
  const kernelspecs = sortBy(store.getState().kernelSpecs ?? {}, "spec.display_name");
  const collections = {
    kernelspec: kernelspecs,
    example: examplesManifest,
    preference: allConfigOptions(store.getState())
      .filter(x => x.values !== undefined || x.valuesFrom === "kernelspecs")
      .map(x => {
        if (x.valuesFrom === "kernelspecs") {
          return {
            ...x,
            values: kernelspecs.map(spec => ({
              value: spec.name,
              label: spec.spec.display_name,
            }))
          }
        }
        else {
          return x;
        }
      }),
  };

  const build = {
    separator: () => ({
      type: "separator" as "separator",
    }),

    url: (label: string, url: string) => ({
      label: processString(label),
      click: () => shell.openExternal(processString(url)),
    }),

    command: (label: string, options: MenuitemOptions, command: Command) =>
      "mapToElectronRole" in command
        ? {
          type: options.type ?? "normal" as "normal",
          checked: options.isChecked,
          label: processString(label),
          role: command.mapToElectronRole,
          accelerator: acceleratorFor(store.getState(), command, options),
        }
        : {
          type: options.type ?? "normal" as "normal",
          checked: options.isChecked,
          label: processString(label),
          click: () => dispatchCommandInMain(command, options.props),
          accelerator: acceleratorFor(store.getState(), command, options),
          enabled: isEnabled(command),
        },

    submenu: (label: string, options: SubmenuOptions, sub: MenuDefinition) => ({
      type: "submenu" as "submenu",
      label: processString(label),
      role: options.role ?? undefined,
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
          } else if (matchesPlatform(item[1] as SubmenuOptions)) {
            yield build.submenu(
              item[0],
              item[1] as SubmenuOptions,
              item[2] as MenuDefinition,
            );
          }
        } else if (typeof item[1] === "string") {
          yield build.url(...item as [string, string])
        } else {
          if (item.length === 2) {
            yield build.command(item[0], {}, item[1] as Command);
          } else if (matchesPlatform(item[2] as MenuitemOptions)) {
            yield build.command(
              item[0],
              item[2] as MenuitemOptions,
              item[1] as Command,
            );
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
  return Menu.buildFromTemplate(buildMenuTemplate(global.store, menu));
}

export function loadTrayMenu() {
  app.setName(appName);
  return Menu.buildFromTemplate(buildMenuTemplate(global.store, tray));
}
