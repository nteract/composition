// @flow
import React from "react";
import ReactMarkdown from "react-markdown";
import MathJax from "@nteract/mathjax";
import RemarkMathPlugin from "./remark-math";

import PropTypes from "prop-types";
import { processEnv } from "./envPreProccessor";

const math = (props: { value: string }) => (
  <MathJax.Node>{props.value}</MathJax.Node>
);

const inlineMath = (props: { value: string }) => (
  <MathJax.Node inline>{props.value}</MathJax.Node>
);

const MarkdownRender = (
  props: ReactMarkdown.ReactMarkdownProps,
  context: { MathJaxContext?: boolean }
) => {
  // const match = ENVIRONMENT.exec(props.source)

  // console.log("match: ", match);

  const newSource = processEnv(props.source);

  const newProps = {
    // https://github.com/rexxars/react-markdown#options
    ...props,
    plugins: [RemarkMathPlugin],
    renderers: {
      ...props.renderers,
      math,
      inlineMath
    }
  };

  newProps.source = newSource;

  // Render a Context if one was not passed as a parent
  if (!context.MathJaxContext) {
    return (
      <MathJax.Context input="tex">
        <ReactMarkdown {...newProps} />
      </MathJax.Context>
    );
  }

  return <ReactMarkdown {...newProps} />;
};

MarkdownRender.contextTypes = {
  // Opt in to updates to the MathJax object even though
  // Not explicitly used
  MathJax: PropTypes.object,
  MathJaxContext: PropTypes.bool
};

export default MarkdownRender;
