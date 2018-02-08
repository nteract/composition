/* @flow */
import * as React from "react";
import PropTypes from "prop-types";

import MathJax from "@nteract/mathjax";

type Props = {
  data: string
};

type Context = {
  MathJax?: Object,
  MathJaxContext?: boolean
};

export const LaTeXDisplay = (props: Props, context: Context) => {
  const math = (
    <div>
      <pre>{props.data}</pre>
      <MathJax.Node>{props.data}</MathJax.Node>
    </div>
  );

  // If there's a MathJaxContext as a parent, rely on it being
  // available for the individual MathJax.Node
  if (context && context.MathJaxContext) {
    return math;
  }

  return <MathJax.Context input="tex">{math}</MathJax.Context>;
};

LaTeXDisplay.MIMETYPE = "text/latex";

LaTeXDisplay.contextTypes = {
  // Opt in to updates to the MathJax object even though
  // Not explicitly used
  MathJax: PropTypes.object,
  MathJaxContext: PropTypes.bool
};

export default LaTeXDisplay;
