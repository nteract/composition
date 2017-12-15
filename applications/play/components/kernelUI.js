import * as React from "react";

class KernelOption extends React.Component {
  render() {
    const { kernelName } = this.props;
    return <option value={kernelName}>{kernelName}</option>;
  }
}

class KernelSelector extends React.Component {
  render() {
    const { kernelspecs, currentKernel, onChange } = this.props;
    return (
      <form>
        <label>
          Current Kernel:
          <select value={currentKernel} onChange={onChange}>
            {Object.keys(kernelspecs).map((kernelName, index) => {
              return <KernelOption kernelName={kernelName} key={kernelName} />;
            })}
          </select>
        </label>
      </form>
    );
  }
}

export class KernelUI extends React.Component {
  render() {
    const { status, ...otherprops } = this.props;
    return (
      <div className="kernel-data">
        <div className="kernelInfo">
          <KernelSelector {...otherprops} />
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
