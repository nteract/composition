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
        <style jsx>
          {`
            form label,
            form select,
            form option {
              font-family: inherit;
              font-size: inherit;
            }
            :global(form span.kernelOption) {
              text-align: center;
            }
          `}
        </style>
      </form>
    );
  }
}

export class KernelUI extends React.Component {
  render() {
    const { status, ...otherprops } = this.props;
    return (
      <div className="kernel-data">
        <div className="kernelSelector">
          <KernelSelector {...otherprops} />
        </div>
        <div className="kernelInfo">
          <span className="kernelStatus">Runtime: </span>
          {this.props.status}
        </div>
        <style jsx>{`
          .kernelInfo {
            color: #f1f1f1;
            line-height: var(--header-height);
            white-space: pre-wrap;
            word-wrap: break-word;
            vertical-align: middle;
            display: table-cell;
            padding-right: 20px;
          }
          .kernel-data {
            font-family: Monaco, monospace;
            font-size: 12px;
          }
          .kernelStatus {
            color: #888;
          }
          .kernelSelector {
            display: table-cell;
            vertical-align: middle;
            padding-right: 10px;
            font-family: inherit;
            font-size: inherit;
          }
        `}</style>
      </div>
    );
  }
}
