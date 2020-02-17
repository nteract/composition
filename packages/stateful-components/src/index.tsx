import { ContentRef } from "@nteract/core";
import React from "react";

import Cells from "./cells/cells";
import CodeCell from "./cells/code-cell";
import MarkdownCell from "./cells/markdown-cell";
import RawCell from "./cells/raw-cell";
import CellToolbar, { CellToolbarContext } from "./cells/toolbar";
import Themer from "./decorators/themer";
import StatusBar, { StatusBarContext } from "./notebook/status-bar";
import { ThemableNotifications } from "./notebook/themable-notifications";

export {
  Cells,
  CodeCell,
  MarkdownCell,
  RawCell,
  CellToolbar,
  CellToolbarContext,
  StatusBar,
  StatusBarContext,
  ThemableNotifications,
  Themer,
};

interface ComponentProps {
  contentRef: ContentRef;
}

export default class Notebook extends React.PureComponent<ComponentProps> {
  render(): JSX.Element {
    return <Cells contentRef={this.props.contentRef} />;
  }
}
