import * as React from "react";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import lightTheme from "react-syntax-highlighter/dist/cjs/styles/prism/vs";
import darkTheme from "react-syntax-highlighter/dist/cjs/styles/prism/xonokai";

interface HighlighterProps {
  language: string;
  className: string;
  children?: React.ReactNode;
  theme?: "light" | "dark";
}

const customStyle = {
  padding: "10px 0px 10px 10px",
  margin: "0px",
  backgroundColor: "var(--cm-background, #fafafa)",
  border: "none"
};

const Highlighter = (props: HighlighterProps) => {
  let language = props.language;
  if (language === "ipython") {
    language = "python";
  } else if (language === "text/x-scala") {
    // Adjust for the scala codemirror type
    language = "scala";
  } else if (language === "text/x-julia") {
    language = "julia";
  } else if (language.startsWith("text/x-")) {
    // Strip off the language from the mimetype
    language = language.slice("text/x-".length);
  }
  return (
    <SyntaxHighlighter
      style={props.theme === "light" ? lightTheme : darkTheme}
      language={language}
      className={props.className}
      customStyle={customStyle}
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
