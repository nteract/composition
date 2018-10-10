/* @flow */
import React from "react";

import Markdown from "@nteract/markdown";
import MarkdownDisplay from "./markdown";

export class LaTeXDisplay extends MarkdownDisplay {
  static MIMETYPE = "text/latex";

  render(): ?React$Element<any> {
    // Only parse math types using the markdown parser
    return (
      <Markdown allowedTypes={[]} unwrapDisallowed source={this.props.data} />
    );
  }
}

export default LaTeXDisplay;
