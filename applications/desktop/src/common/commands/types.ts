import { ContentRef, KernelspecInfo } from "@nteract/core";
import { ManifestItem } from "@nteract/examples";
import { Action, Store } from "redux";
import { DesktopStore } from "../../notebook/store";

export type ActionTemplate<PROPS> =
  | ((props: PROPS) => Action | Promise<Action | undefined>)
  | ((props: {})    => Action | Promise<Action | undefined>)
  ;

export type ActionTemplateGenerator<PROPS> =
  | Generator<ActionTemplate<PROPS>>
  | AsyncGenerator<ActionTemplate<PROPS>>
  ;

export interface ActionCommand<STORE extends Store, PROPS> {
  name: string;
  makeActionTemplates: (store: STORE, props: PROPS) =>
    ActionTemplateGenerator<PROPS>;
}

export type Command =
  | ActionCommand<Store, {}>
  | {
      name: string;
      mapToElectronRole: string;
    }
  ;

export interface RequiresContent { contentRef: ContentRef }
export interface RequiresKernelSpec { kernelSpec: KernelspecInfo }

export type DesktopCommand<PROPS = {}> = ActionCommand<DesktopStore, PROPS>;

// == Menu Structure ==
export type MenuStructure = MenuStructureItem[];
export type MenuStructureItem =
  // Submenu
  | [string, SubmenuOptions, MenuStructure]
  | [string, MenuStructure]

  // Dynamic Menu
  | DyanamicMenuItems<"kernelspec", KernelspecInfo>
  | DyanamicMenuItems<"example", ManifestItem>

  // Menuitem
  | [string, Command | ActionCommand<any, any>, MenuitemOptions]
  | [string, Command | ActionCommand<any, any>]

  // URL
  | [string, string]

  // Divider
  | []
  ;

export interface DyanamicMenuItems<NAME extends string, T> {
  forEach: NAME;
  create: (item: T) => MenuStructureItem;
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
  | "appMenu"
  | "window"
  | "help"
  | "services"
  | "recentDocuments"
  ;

export type Platform =
  | "win32"
  | "linux"
  | "darwin"
  | "!win32"
  | "!linux"
  | "!darwin"
  ;
