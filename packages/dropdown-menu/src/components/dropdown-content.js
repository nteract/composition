// @flow
import { areComponentsEqual } from "react-hot-loader";
import * as React from "react";

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
      <React.Fragment>
        <ul>
          {React.Children.map(this.props.children, child => {
            return React.cloneElement(child, {
              onClick: ev => {
                if (child.props.onClick) {
                  child.props.onClick(ev);
                }
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
            /* top: 0.2em; */
            /* right: 0; */
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

          :global(li) {
            padding: 0.5rem;
          }

          :global(li:hover) {
            background-color: var(--theme-cell-menu-bg-hover, #e2dfe3);
            cursor: pointer;
          }
        `}</style>
      </React.Fragment>
    );
  }
}
