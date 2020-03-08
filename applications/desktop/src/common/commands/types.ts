import { ContentRef, KernelspecInfo } from "@nteract/core";
import { ManifestItem } from "@nteract/examples";
import { Action, Store } from "redux";
import { OptionalKeys, RequiredKeys } from "utility-types";
import { DesktopStore } from "../../notebook/store";

export type ActionGenerator =
  | Generator<Action | Promise<Action>>
  | AsyncGenerator<Action | Promise<Action>>
  ;

export interface ActionCommand<STORE extends Store, PROPS> {
  name: string;
  props: { [key in RequiredKeys<PROPS>]: "required" }
       & { [key in OptionalKeys<PROPS>]: "optional" };
  makeAction?: (props: PROPS) => Action;
  makeActions?: (store: STORE, props: PROPS) => ActionGenerator;
}

export interface ElectronRoleCommand {
  name: string;
  mapToElectronRole: ElectronMenuItemRole;
}

export type Command =
  | ActionCommand<any, any>
  | ElectronRoleCommand
  ;

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
  | DyanamicMenuItems<"kernelspec", KernelspecInfo>
  | DyanamicMenuItems<"example", ManifestItem>

  // Menuitem
  | [string, Command, MenuitemOptions]
  | [string, Command]

  // URL
  | [string, string]

  // Divider
  | []
  ;

export interface DyanamicMenuItems<NAME extends string, T> {
  forEach: NAME;
  create: (item: T) => MenuDefinitionItem;
}

export interface MenuitemOptions {
  platform?: Platform;
  params?: {};
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
  | "recentDocuments"
  ;

// from https://www.electronjs.org/docs/api/menu-item#roles
export type ElectronMenuItemRole =
  | "undo"
  | "redo"
  | "cut"
  | "copy"
  | "paste"
  | "pasteAndMatchStyle"
  | "selectAll"
  | "delete"
  | "minimize"
  | "close"
  | "quit"
  | "reload"
  | "forceReload"
  | "toggleDevTools"
  | "togglefullscreen"
  | "resetZoom"
  | "zoomIn"
  | "zoomOut"
  | "about"
  | "hide"
  | "hideOthers"
  | "unhide"
  | "startSpeaking"
  | "stopSpeaking"
  | "front"
  | "zoom"
  | "toggleTabBar"
  | "selectNextTab"
  | "selectPreviousTab"
  | "mergeAllWindows"
  | "moveTabToNewWindow"
  | "clearRecentDocuments"
  ;

export type Platform =
  | "win32"
  | "linux"
  | "darwin"
  | "!win32"
  | "!linux"
  | "!darwin"
  ;
