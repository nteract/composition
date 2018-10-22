/* @flow */
import React from "react";
import MathJax from "@nteract/mathjax";

type Props = {
  data: string
};

export const LaTeXDisplay = (props: Props) => {
  return <MathJax.Text>{props.data}</MathJax.Text>;
};

LaTeXDisplay.MIMETYPE = "text/latex";

export default LaTeXDisplay;
