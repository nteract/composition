/* @flow */
import React from "react";
// $FlowFixMe
import Ansi from "ansi-to-react";

type Props = {
  data: string,
  mediaType: "text/plain"
};

export default class TextDisplay extends React.PureComponent<Props, null> {
  static MIMETYPE = "text/plain";

  static defaultProps = {
    data: "",
    mediaType: "text/plain"
  };

  render(): ?React$Element<any> {
    return (
      <pre>
        <Ansi linkify={false}>{this.props.data}</Ansi>
      </pre>
    );
  }
}
