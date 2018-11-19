/* @flow */

import * as React from "react";

type IconButtonProps = {
  message: string,
  onClick: () => void,
  children?: React.Node,
  title: string,
  selected: boolean
};

export class IconButton extends React.Component<IconButtonProps> {
  render() {
    const {
      message,
      onClick,
      children,
      selected,
      title = message
    } = this.props;

    let style: Object = {
      width: "32px",
      height: "32px",
      cursor: "pointer",
      color: "var(--theme-app-fg)",
      border: "1px solid var(--theme-app-fg)",
      backgroundColor: "var(--theme-app-bg)"
    };

    if (selected) {
      style.border = "1px outset #666";
      style.backgroundColor = "#aaa";
    }

    return (
      <button onClick={onClick} key={message} title={title} style={style}>
        {children}
      </button>
    );
  }
}
