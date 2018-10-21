/* @flow */
import React from "react";
import { ansiToInlineStyle } from "ansi-to-react";

type Props = {
  data: string
};

export default class TextDisplay extends React.Component<Props, null> {
  static MIMETYPE = "text/plain";

  shouldComponentUpdate(nextProps: Props) {
    // Calculate shouldComponentUpdate because we don't use metadata or models
    // on the plaintext transform
    return nextProps.data !== this.props.data;
  }

  render(): ?React$Element<any> {
    return (
      <pre>
        {ansiToInlineStyle(this.props.data).map((bundle, key) => (
          <span style={bundle.style} key={key}>
            {bundle.content}
          </span>
        ))}
      </pre>
    );
  }
}
