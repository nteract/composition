import React, { HTMLAttributes, ReactChild, Component } from "react";
import classnames from "classnames";
import { ToolbarItem } from "./toolbar-item";

import { Expand, Collapse, ExpandSidebar } from "./Icons";

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactChild | JSX.Element[];
  onToggleFileBrowser: () => void;
  isSidebarVisible?: boolean;
}

export interface State {
  toolbarState: string;
}

const toolbarStates = {
  collapsed: "collapsed",
  expandedMin: "expandedMin",
  expandedMax: "expandedMax",
};

export class Toolbar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      toolbarState: toolbarStates.collapsed,
    };
  }

  render() {
    const { children, onToggleFileBrowser, isSidebarVisible } = this.props;
    const { toolbarState } = this.state;
    const isCollapsed = toolbarState === toolbarStates.collapsed;

    const className: string = classnames("toolbar", {
      expanded: toolbarState !== toolbarStates.collapsed,
    });

    return (
      <div className={className} style={{ backgroundColor: "rgb(240,240,240)", borderBottom: "1px solid #22a6f1"}}>
        <span>
          {React.Children.map(
            children as React.ReactElement[],
            (child: React.ReactElement) =>
              React.cloneElement(child as React.ReactElement, {
                showText: true,
                showButton: true,
              })
          )}
        </span>
      </div>
    );
  }
}
