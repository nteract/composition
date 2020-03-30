import { ContentRef, KernelspecInfo } from "@nteract/core";
import { ManifestItem } from "@nteract/examples";
import { ConfigurationOption } from "@nteract/mythic-configuration";
import { Action, Store } from "redux";
import { OptionalKeys, RequiredKeys } from "utility-types";
import { DesktopStore } from "../../notebook/store";

export type Command =
  | ActionCommand<any, any>
  | ElectronRoleCommand
  ;

export interface ActionCommand<STORE extends Store, PROPS> {
  name: string;
  props: { [key in RequiredKeys<PROPS>]: "required" }
       & { [key in OptionalKeys<PROPS>]: "optional" };
  runInMainThread?: (props: PROPS) => void;
  makeAction?: (props: PROPS) => Action;
  makeActions?: (store: STORE, props: PROPS) => ActionGenerator;
}

export type ActionGenerator =
  | Generator<Action | Promise<Action>>
  | AsyncGenerator<Action | Promise<Action>>
  ;

export interface ElectronRoleCommand {
  name: string;
  mapToElectronRole: ElectronMenuItemRole;
}

export interface ReqContent { contentRef: ContentRef }
export interface ReqKernelSpec { kernelSpec: KernelspecInfo }

export type DesktopCommand<T = {}> = ActionCommand<DesktopStore, T>;

// == Menu Definition ==
export type MenuDefinition = MenuDefinitionItem[];
export type MenuDefinitionItem =
  // Submenu
  | [string, SubmenuOptions, MenuDefinition]
  | [string, MenuDefinition]

  // Dynamic Menu
  | DynamicMenuItems<"kernelspec", KernelspecInfo>
  | DynamicMenuItems<"example", ManifestItem>
  | DynamicMenuItems<"preference", ConfigurationOption>

  // Menuitem
  | [string, Command, MenuitemOptions]
  | [string, Command]

  // URL
  | [string, string]

  // Divider
  | []
  ;

export interface DynamicMenuItems<NAME extends string, T> {
  forEach: NAME;
  create: (item: T) => MenuDefinitionItem;
}

export interface MenuitemOptions {
  platform?: Platform;
  props?: {};
}

export interface SubmenuOptions {
  platform?: Platform;
  role?: ElectronSubmenuRole;
}

// from https://www.electronjs.org/docs/api/menu-item#roles
export type ElectronSubmenuRole =
  | "fileMenu"
  | "editMenu"
  | "viewMenu"
  | "windowMenu"
  | "appMenu"
  | "window"
  | "help"
  | "services"
  ;

// from https://www.electronjs.org/docs/api/menu-item#roles
export type ElectronMenuItemRole =
  | "undo"
  | "redo"
  | "cut"
  | "copy"
  | "paste"
  | "pasteandmatchstyle"
  | "selectall"
  | "delete"
  | "minimize"
  | "close"
  | "quit"
  | "reload"
  | "forcereload"
  | "toggledevtools"
  | "togglefullscreen"
  | "resetzoom"
  | "zoomin"
  | "zoomout"
  | "about"
  | "hide"
  | "hideothers"
  | "unhide"
  | "startspeaking"
  | "stopspeaking"
  | "front"
  | "zoom"
  ;

export type Platform =
  | "win32"
  | "linux"
  | "darwin"
  | "!win32"
  | "!linux"
  | "!darwin"
  ;

// == Accelerators ==
export interface Accelerators {
  [commandName: string]: string | undefined | {
    win32?: string;
    linux?: string;
    darwin?: string;
    others?: string;
    interceptEarly?: boolean;
  }
}
