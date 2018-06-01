// @flow
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
              onClick: ev => {
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
                onItemClick: ev => {
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
            display: inline-block;
          }
        `}</style>
      </div>
    );
  }
}
