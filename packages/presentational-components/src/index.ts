import { Cell } from "./components/cell";
import { Cells } from "./components/cells";
import { CircularButton } from "./components/CircularButton";
import Error from "./components/error";
import { Input } from "./components/input";
import { Outputs } from "./components/outputs";
import { Pagers } from "./components/pagers";
import { Prompt, PromptBuffer } from "./components/prompt";
import { Sidebar, SidebarItem, SidebarItemProps } from "./components/sidebar";
import { Source } from "./components/source";

import { CellMenu, CellMenuItem, CellMenuSection } from "./components/CellMenu";
import { ToggleSwitch } from "./components/ToggleSwitch/ToggleSwitch";
import { DarkTheme, LightTheme } from "./styles";

import {
  CommandButtonRow,
  CommandPalette,
  Props as CommandPaletteProps,
} from "./components/command-palette";

import * as Icons from "./components/icons";
export * from "./styles";

import {
  Clear,
  Collapse,
  Commands,
  Expand,
  ExpandSidebar,
  Group,
  Pause,
  Play,
  Plus,
  Toolbar,
  ToolbarItem,
  ToolbarItemProps,
} from "./components/toolbar";

const ToolbarIcons = {
  Clear,
  Commands,
  Expand,
  Collapse,
  ExpandSidebar,
  Group,
  Pause,
  Play,
  Plus,
};

export {
  CommandButtonRow,
  CommandPalette,
  CircularButton,
  CellMenu,
  CellMenuItem,
  CellMenuSection,
  Icons,
  ToggleSwitch,
  LightTheme,
  DarkTheme,
  Input,
  Outputs,
  Pagers,
  Prompt,
  PromptBuffer,
  Source,
  Cell,
  Cells,
  Error,
  Sidebar,
  SidebarItem,
  Toolbar,
  ToolbarItem,
  ToolbarIcons,
};

export type SidebarItemProps = SidebarItemProps;
export type ToolbarItemProps = ToolbarItemProps;
export type CommandPaletteProps = CommandPaletteProps;
