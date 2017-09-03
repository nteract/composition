/* @flow */
import React from "react";
import CommonMark from "commonmark";
import MarkdownRenderer from "commonmark-react-renderer";

type Props = {
  data: string
};

type MDRender = (input: string) => string;

const parser = new CommonMark.Parser();
const renderer = new MarkdownRenderer();

const mdRender: MDRender = input => renderer.render(parser.parse(input));

export class MarkdownDisplay extends React.Component<Props> {
  static MIMETYPE = "text/markdown";

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  render(): ?React$Element<any> {
    return <div>{mdRender(this.props.data)}</div>;
  }
}

export default MarkdownDisplay;
