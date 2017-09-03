// @flow
/* eslint-disable react/prefer-stateless-function, react/prop-types */

import React from "react";
import CommonMark from "commonmark";
import MarkdownRenderer from "commonmark-react-renderer";

import LatexRenderer from "./latex";

type MDRender = (input: string) => string;

const parser = new CommonMark.Parser();
const renderer = new MarkdownRenderer();

const mdRender: MDRender = input => renderer.render(parser.parse(input));

export default class MarkdownCell extends React.PureComponent<any> {
  render(): ?React$Element<any> {
    return (
      <div className="rendered">
        <LatexRenderer>{mdRender(this.props.cell.get("source"))}</LatexRenderer>
      </div>
    );
  }
}
