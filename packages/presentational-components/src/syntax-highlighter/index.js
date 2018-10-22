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
  } else if (language === "text/x-scala") {
    // Adjust for the scala codemirror type
    language = "scala";
  } else if (language.startsWith("text/x-")) {
    // Strip off the language from the mimetype
    language = language.slice("text/x-".length);
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
