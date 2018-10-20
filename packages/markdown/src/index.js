// @flow
import React from "react";
import ReactMarkdown from "react-markdown";
import MathJax from "@nteract/mathjax";
import RemarkMathPlugin from "./remark-math";

const math = (props: { value: string }) => (
  <MathJax.Node>{props.value}</MathJax.Node>
);

const inlineMath = (props: { value: string }) => (
  <MathJax.Node inline>{props.value}</MathJax.Node>
);

const MarkdownRender = (props: ReactMarkdown.ReactMarkdownProps) => {
  const newProps = {
    // https://github.com/rexxars/react-markdown#options
    ...props,
    escapeHtml: false,
    plugins: [RemarkMathPlugin],
    renderers: {
      ...props.renderers,
      math,
      inlineMath
    }
  };

  return <ReactMarkdown {...newProps} />;
};

export default MarkdownRender;
