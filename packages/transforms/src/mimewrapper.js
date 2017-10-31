/* @flow */
import React from "react";

type Props = {
  data: string
};

export default class MimeWrapper extends React.Component<Props> {
  componentDidCatch(error, info) {
    return (
      <div>
        <pre
          style={{
            backgroundColor: "ghostwhite",
            color: "black",
            fontWeight: "600",
            display: "block",
            padding: "10px",
            marginBottom: "20px"
          }}
        >
          There was an error rendering LaTeX data from the kernel or notebook
        </pre>
        <code>{error.toString()}</code>
      </div>
    );
  }

  render(): ?React$Element<any> {
    try {
      return <div>{this.props.children}</div>;
    } catch (err) {
      return componentDidCatch(err, "");
    }
  }
}
