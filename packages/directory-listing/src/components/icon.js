// @flow
import * as React from "react";
import { Book, FileText, FileDirectory } from "@nteract/octicons";

type IconProps = {
  color: string,
  fileType: "unknown" | "notebook" | "directory" | "file" | "dummy"
};

export class Icon extends React.Component<IconProps, null> {
  static defaultProps = {
    fileType: "file",
    color: "#0366d6"
  };

  render() {
    let icon = <FileText />;
    switch (this.props.fileType) {
      case "notebook":
        icon = <Book />;
        break;
      case "directory":
        icon = <FileDirectory />;
        break;
      case "file":
        icon = <FileText />;
        break;
      default:
        icon = <FileText />;
    }

    return (
      <td className="icon" style={{ color: this.props.color }}>
        {icon}
        <style jsx>{`
          .icon {
            padding-right: 2px;
            padding-left: 10px;
            width: 17px;
            vertical-align: middle;
            text-align: center;
            opacity: 0.95;
            color: #0366d6;
          }
        `}</style>
      </td>
    );
  }
}
