// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

// react-hot-loader uses proxies to the original elements so we need to use
// their comparison function in case a consumer of these components is
// using hot module reloading
import { areComponentsEqual } from "react-hot-loader";
import * as React from "react";

type DropdownMenuProps = {
  children: React.ChildrenArray<React.Element<*>>
};

type DropdownMenuState = {
  menuHidden: boolean
};

export class DropdownMenu extends React.Component<
  DropdownMenuProps,
  DropdownMenuState
> {
  constructor(props: *) {
    super(props);
    this.state = {
      menuHidden: true
    };
  }

  render() {
    return (
      <div className="dropdown">
        {React.Children.map(this.props.children, child => {
          if (areComponentsEqual(child.type, DropdownTrigger)) {
            return React.cloneElement(child, {
              onClick: () => {
                this.setState({ menuHidden: !this.state.menuHidden });
              }
            });
          } else if (areComponentsEqual(child.type, DropdownContent)) {
            if (this.state.menuHidden) {
              return null;
            } else {
              // DropdownContent child will pass down an onItemClick so that
              // the menu will collapse
              return React.cloneElement(child, {
                onItemClick: () => {
                  this.setState({ menuHidden: true });
                }
              });
            }
          } else {
            // fallback
            return child;
          }
        })}
        <style jsx>{`
          .dropdown {
            z-index: 10000;
            display: inline-block;
          }
        `}</style>
      </div>
    );
  }
}

export class DropdownTrigger extends React.Component<{
  children: React.ChildrenArray<React.Element<*>>,
  onClick?: (ev: SyntheticEvent<*>) => void
}> {
  render() {
    return (
      <div onClick={this.props.onClick}>
        {this.props.children}
        <style jsx>{`
          div {
            user-select: none;
            margin: 0px;
            padding: 0px;
          }
        `}</style>
      </div>
    );
  }
}

export class DropdownContent extends React.Component<{
  children: React.ChildrenArray<React.Element<*>>,
  onItemClick: (ev: SyntheticEvent<*>) => void
}> {
  static defaultProps = {
    // Completely silly standalone, because DropdownMenu injects the onItemClick handler
    onItemClick: () => {}
  };

  render() {
    return (
      <div>
        <ul>
          {React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
              onClick: ev => {
                child.props.onClick(ev);
                // Hide the menu
                this.props.onItemClick(ev);
              }
            });
          })}
        </ul>
        <style jsx>{`
          div {
            user-select: none;
            margin: 0px;
            padding: 0px;

            width: 200px;

            opacity: 1;
            position: absolute;
            top: 0.2em;
            right: 0;
            border-style: none;
            padding: 0;
            font-family: var(--nt-font-family-normal);
            font-size: var(--nt-font-size-m);
            line-height: 1.5;
            margin: 20px 0;
            background-color: var(--theme-cell-menu-bg);
          }

          ul {
            list-style: none;
            text-align: left;
            padding: 0;
            margin: 0;
            opacity: 1;
          }

          ul :global(li) {
            padding: 0.5rem;
          }

          ul :global(li:hover) {
            background-color: var(--theme-cell-menu-bg-hover, #e2dfe3);
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }
}
