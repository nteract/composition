// @flow

import * as React from "react";

type NameProps = {
  children: React.Node
};

export class Name extends React.Component<NameProps, null> {
  static defaultProps = {
    children: null
  };

  render() {
    return (
      <td className="name">
        {this.props.children}
        <style jsx>{`
          .name {
            vertical-align: middle;
            font-size: 0.9em;
            padding: 8px;
          }

          .name :global(a) {
            text-decoration: none;
          }

          .name :global(a:hover) {
            text-decoration: underline;
            outline-width: 0;
          }
        `}</style>
      </td>
    );
  }
}
