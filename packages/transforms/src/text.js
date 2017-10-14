/* @flow */
import React from "react";

import Ansi from "ansi-to-react";

type Props = {
  data: string
};

export default class TextDisplay extends React.PureComponent<Props> {
  static MIMETYPE = "text/plain";

  render(): ?React$Element<any> {
    return <Ansi>{this.props.data}</Ansi>;
  }
}
