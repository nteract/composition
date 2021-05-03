import React, { HTMLAttributes } from "react";

import classnames from "classnames";

interface CellMenuProps extends React.FC<HTMLAttributes<HTMLDivElement>> {
  visible: boolean;
}

export type Props = React.FC<HTMLAttributes<HTMLUListElement>>;

interface MenuItemProps extends React.FC<HTMLAttributes<HTMLLIElement>> {
  className?: string;
  onClick?: () => void;
  focusWithin?: boolean;
  tabIndex?: number;
}

export const CellMenuSection: Props = ({ children }) => {
  return <ul className="cell-menu-section">{children}</ul>;
};

export class CellMenuItem extends React.PureComponent<MenuItemProps, {}> {
  element: any = React.createRef();

  handleKeypress = (e: KeyboardEvent) => {
    if (e.keyCode === 13 || e.keyCode === 32) {
      this.props.onClick && this.props.onClick();
    }
  };

  handleFocus = () => {
    if (this.props.focusWithin) {
      this.element.current.querySelector(":first-child").focus();
    }
  };

  componentDidMount() {
    this.element.current.addEventListener("focus", this.handleFocus);
    this.element.current.addEventListener("keypress", this.handleKeypress);
  }

  componentWillUnmount() {
    this.element.current.removeEventListener("focus", this.handleFocus);
    this.element.current.removeEventListener("keypress", this.handleKeypress);
  }

  render() {
    const { children, className, focusWithin, ...props } = this.props;

    return (
      <li
        ref={this.element}
        className={classnames("cell-menu-item", "mdl-menu__item", className)}
        {...props}
      >
        {children}
      </li>
    );
  }
}

export const CellMenu: React.FC<CellMenuProps> = ({ visible, children }) => {
  return (
    <div className={visible ? "mdl-menu cell-menu mdl-shadow--3dp" : "mdl-menu cell-menu-hidden cell-menu"}>
      {children}
    </div>
  );
};
