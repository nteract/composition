// @flow

import * as React from "react";

export default class HTMLView extends React.Component<*> {
  ifr: ?HTMLIFrameElement;

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
          ref={f => {
            this.ifr = f;
          }}
          height="100%"
          width="100%"
        />
      </div>
    );
  }
}
