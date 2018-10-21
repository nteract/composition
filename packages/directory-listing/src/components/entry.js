// @flow
import * as React from "react";
import { areComponentsEqual } from "react-hot-loader";

import { Icon } from "./icon";
import { Name } from "./name";
import { LastSaved } from "./lastsaved";

type EntryProps = {
  children: React.Node
};

export class Entry extends React.Component<EntryProps, null> {
  static defaultProps = {
    children: null
  };

  render() {
    return (
      <tr className="directory-entry">
        {React.Children.map(this.props.children, child => {
          if (
            areComponentsEqual(child.type, Icon) ||
            areComponentsEqual(child.type, Name) ||
            areComponentsEqual(child.type, LastSaved)
          ) {
            return React.cloneElement(child, {
              className:
                typeof child.props.className === String &&
                child.props.className !== ""
                  ? child.props.className + " directory-entry-field"
                  : "directory-entry-field"
            });
          } else {
            return <td className="directory-entry-field">{child}</td>;
          }
        })}
        <style jsx>{`
          tr {
            border-top: 1px solid #eaecef;
          }

          tr:hover {
            background-color: #f6f8fa;
            transition: background-color 0.1s ease-out;
          }

          tr:first-child {
            border-top: none;
          }

          tr:last-child {
            border-bottom: none;
          }
        `}</style>
      </tr>
    );
  }
}
