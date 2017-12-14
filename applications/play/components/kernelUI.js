import * as React from "react";

// TODO: Make a generic little console for some of the styled container pieces,
//       then make this component inject the binder specific bits
export class KernelUI extends React.Component {
  render() {
    const { status } = this.props;
    return (
      <div className="kernel-data">
        <div className="kernelInfo">
          <span className="kernel">Runtime: </span>
          {this.props.status}
        </div>
        <style jsx>{`
          .kernelInfo {
            color: #f1f1f1;
            line-height: var(--header-height);
            font-family: Monaco, monospace, system-ui;
            font-size: 12px;
            white-space: pre-wrap;
            word-wrap: break-word;
            vertical-align: middle;
            display: table-cell;
            padding-right: 20px;
          }
          .kernel {
            color: #888;
          }
        `}</style>
      </div>
    );
  }
}
