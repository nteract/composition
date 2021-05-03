import { ContentRef } from "@nteract/core";
import React from "react";

import AppSidebar, { AppSidebarContext, AppSidebarProps } from "./app-sidebar";
import AppToolbar, { AppToolbarContext, AppToolbarProps } from "./app-toolbar";
import Cells from "./cells/cells";
import CodeCell from "./cells/code-cell";
import MarkdownCell from "./cells/markdown-cell";
import RawCell from "./cells/raw-cell";
import CellToolbar, { CellToolbarContext } from "./cells/toolbar";
import StatusBar, { StatusBarContext } from "./notebook/status-bar";

import ThemeFromConfig from "./decorators/theme-from-config";

import {
  CommandContext,
  CommandProps,
  default as CommandContainer,
  DispatchProps as CommandDispatchProps,
} from "./command-palette/command-palette";

export {
  Cells,
  CodeCell,
  MarkdownCell,
  RawCell,
  CellToolbar,
  CellToolbarContext,
  StatusBar,
  StatusBarContext,
  ThemeFromConfig,
  CommandContext,
  CommandContainer,
  AppToolbar,
  AppToolbarContext,
  AppSidebar,
  AppSidebarContext,
};

export type CommandProps = CommandProps;
export type CommandDispatchProps = CommandDispatchProps;
export type AppToolbarProps = AppToolbarProps;
export type AppSidebarProps = AppSidebarProps;

export { userTheme } from "./config-options";

interface ComponentProps {
  contentRef: ContentRef;
}

export default class Notebook extends React.PureComponent<ComponentProps> {
  render(): JSX.Element {
    return <Cells contentRef={this.props.contentRef} />;
  }
}
