// @flow
import SyntaxHighlighter from "react-syntax-highlighter/prism";
import * as React from "react";

import {
  xonokai as darkTheme,
  vs as lightTheme
} from "react-syntax-highlighter/styles/prism";

// import syntax from "./theme";

type HighlighterProps = {
  language: string,
  className: string,
  children: React.Node,
  theme: "light" | "dark"
};

const Highlighter = (props: HighlighterProps) => {
  let language = props.language;
  if (language === "ipython") {
    language = "python";
  }

  return (
    <SyntaxHighlighter
      style={props.theme === "light" ? lightTheme : darkTheme}
      language={language}
      className={props.className}
      customStyle={{
        padding: "10px 0px 10px 10px",
        margin: "0px",
        backgroundColor: "var(--cm-background, #fafafa)",
        border: "none"
      }}
    >
      {props.children}
    </SyntaxHighlighter>
  );
};

Highlighter.defaultProps = {
  theme: "light",
  language: "text",
  children: "",
  className: "input"
};

export default Highlighter;
