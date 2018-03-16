// @flow
import React from "react";
import ReactMarkdown from "react-markdown";
import MathJax from "@nteract/mathjax";
import RemarkMathPlugin from "./remark-math";

import PropTypes from "prop-types";

const html = ({ value, isBlock }: { value: string, isBlock: boolean }) => {
  return React.createElement(isBlock ? "div" : "span", {
    dangerouslySetInnerHTML: { __html: value }
  });
};

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
  const newProps = {
    // https://github.com/rexxars/react-markdown#options
    ...props,
    plugins: [RemarkMathPlugin],
    renderers: {
      ...props.renderers,
      math,
      inlineMath,
      html
    },
    // ⚠️ since the notebook allows HTML embed in Markdown, allow it by default
    escapeHtml: false
  };

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
