/* @flow */
import * as React from "react";
import MarkdownComponent from "@nteract/markdown";

type Props = {
  data: string,
  mediaType: string
};

export class Markdown extends React.Component<Props> {
  static defaultProps = {
    mediaType: "text/markdown",
    data: null
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  render(): ?React$Element<any> {
    return <MarkdownComponent source={this.props.data} />;
  }
}
