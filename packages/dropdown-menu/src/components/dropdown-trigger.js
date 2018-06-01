// @flow
import { areComponentsEqual } from "react-hot-loader";
import * as React from "react";

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
