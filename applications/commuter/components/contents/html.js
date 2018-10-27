// @flow
import * as React from "react";

export default class HTMLView extends React.Component<*> {
  ifrRef: React.ElementRef<*> = React.createRef();

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div
        style={{
          position: "fixed",
          width: "100%",
          height: "100%"
        }}
      >
        <iframe
          title={`view of ${this.props.entry.path}`}
          sandbox="allow-scripts"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            margin: "0",
            padding: "0",
            display: "block"
          }}
          srcDoc={this.props.entry.content}
          ref={this.ifrRef}
          height="100%"
          width="100%"
        />
      </div>
    );
  }
}
