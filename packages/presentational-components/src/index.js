// @flow
import * as React from "react";

import Highlighter from "./syntax-highlighter";

export * from "./styles";

import * as themes from "./themes";
export { themes };

export type PagersProps = {
  children: React.Node,
  hidden: boolean
};

export class Pagers extends React.Component<PagersProps> {
  static defaultProps = {
    children: null,
    hidden: false
  };

  render(): React.Node {
    if (
      this.props.hidden ||
      this.props.children === null ||
      React.Children.count(this.props.children) === 0
    ) {
      return null;
    }
    return (
      <div className="pagers">
        {/*
          Implementation wise, the CSS _is_ the same as the outputs even
          if these aren't actually outputs.

          One noted difference is the background color of the pagers though
         */}
        <Outputs>{this.props.children}</Outputs>
        <style jsx>{`
          .pagers {
            background-color: var(--theme-pager-bg, #fafafa);
          }
        `}</style>
      </div>
    );
  }
}

export type OutputsProps = {
  children: React.Node,
  hidden: boolean
};

export class Outputs extends React.Component<OutputsProps> {
  static defaultProps = {
    children: null,
    hidden: false
  };

  render() {
    if (this.props.hidden) {
      return null;
    }

    if (this.props.children) {
      return (
        <div className="outputs">
          {this.props.children}
          <style jsx>{`
            .outputs {
              padding: 10px 10px 10px calc(var(--prompt-width, 50px) + 10px);
              word-wrap: break-word;
              overflow-y: auto;
              outline: none;
            }

            .outputs :global(a) {
              color: var(--link-color-unvisited, blue);
            }

            .outputs :global(a:visited) {
              color: var(--link-color-visited, blue);
            }

            .outputs > :global(div:empty) {
              display: none;
            }

            .outputs :global(code) {
              font-family: "Source Code Pro";
              white-space: pre-wrap;
              font-size: 14px;
            }

            .outputs :global(pre) {
              white-space: pre-wrap;
              font-size: 14px;
              word-wrap: break-word;
            }

            .outputs :global(img) {
              display: block;
              max-width: 100%;
            }

            .outputs :global(kbd) {
              display: inline-block;
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 0.1em 0.5em;
              margin: 0 0.2em;
              box-shadow: 0 1px 0px rgba(0, 0, 0, 0.2), 0 0 0 2px #fff inset;
              background-color: #f7f7f7;
            }

            .outputs :global(table) {
              border-collapse: collapse;
            }

            .outputs :global(th),
            .outputs :global(td),
            .outputs :global(.th),
            /* for legacy output handling */ .outputs :global(.td) {
              padding: 0.5em 1em;
              border: 1px solid var(--theme-app-border, #cbcbcb);
            }

            .outputs :global(th) {
              text-align: left;
            }

            .outputs :global(blockquote) {
              padding: 0.75em 0.5em 0.75em 1em;
              background: var(--theme-cell-output-bg, white);
              border-left: 0.5em solid #ddd;
            }

            .outputs :global(.blockquote::before) {
              display: block;
              height: 0;
              content: "“";
              margin-left: -0.95em;
              font: italic 400%/1 Open Serif, Georgia, "Times New Roman", serif;
              color: solid var(--theme-app-border, #cbcbcb);
            }

            /* for nested paragraphs in block quotes */
            .outputs :global(blockquote) p {
              display: inline;
            }

            .outputs :global(dd) {
              display: block;
              -webkit-margin-start: 40px;
            }
            .outputs :global(dl) {
              display: block;
              -webkit-margin-before: 1__qem;
              -webkit-margin-after: 1em;
              -webkit-margin-start: 0;
              -webkit-margin-end: 0;
            }

            .outputs :global(dt) {
              display: block;
            }

            .outputs :global(dl) {
              width: 100%;
              overflow: hidden;
              padding: 0;
              margin: 0;
            }

            .outputs :global(dt) {
              font-weight: bold;
              float: left;
              width: 20%;
              /* adjust the width; make sure the total of both is 100% */
              padding: 0;
              margin: 0;
            }

            .outputs :global(dd) {
              float: left;
              width: 80%;
              /* adjust the width; make sure the total of both is 100% */
              padding: 0;
              margin: 0;
            }

            /** Adaptation for the R kernel's inline lists **/
            .outputs :global(.list-inline) li {
              display: inline;
              padding-right: 20px;
              text-align: center;
            }

            /** Note omission of the li:only-child styling **/
          `}</style>
        </div>
      );
    }

    return null;
  }
}
// Totally fake component for consistency with indents of the editor area
export class PromptBuffer extends React.Component<*> {
  render() {
    return <div className="prompt" />;
  }
}

export function promptText(props: PromptProps) {
  if (props.running) {
    return "[*]";
  }
  if (props.queued) {
    return "[…]";
  }
  if (typeof props.counter === "number") {
    return `[${props.counter}]`;
  }
  return "[ ]";
}

type PromptProps = {
  counter: number | null,
  running: boolean,
  queued: boolean
};

export class Prompt extends React.Component<PromptProps> {
  static defaultProps = {
    counter: null,
    running: false,
    queued: false
  };

  render() {
    return <div className="prompt">{promptText(this.props)}</div>;
  }
}

export type SourceProps = {
  language: string,
  children: React.Node,
  className?: string,
  theme: "light" | "dark"
};

export class Source extends React.Component<SourceProps> {
  static defaultProps = {
    children: "",
    language: "text",
    className: "input",
    theme: "light"
  };

  render() {
    // Build in a default renderer when they pass a plain string
    // This is primarily for use with non-editable contexts (notebook-preview)
    // to make rendering much faster (compared to codemirror)
    // Ref: https://github.com/nteract/notebook-preview/issues/20
    if (typeof this.props.children === "string") {
      return (
        <Highlighter
          language={this.props.language}
          className={this.props.className}
        >
          {this.props.children}
        </Highlighter>
      );
    }
    // Otherwise assume they have their own editor component
    return <div className="input">{this.props.children}</div>;
  }
}

export type InputProps = {
  children: React.Node,
  hidden: boolean
};

export class Input extends React.Component<InputProps> {
  static defaultProps = {
    children: null,
    hidden: false
  };

  render() {
    if (this.props.hidden) {
      return null;
    }

    return (
      <div className="input-container">
        {this.props.children}
        <style jsx>{`
          .input-container {
            display: flex;
            flex-direction: row;
          }

          .input-container.invisible {
            height: 34px;
          }

          .input-container :global(.prompt) {
            font-family: monospace;
            font-size: 12px;
            line-height: 22px;

            width: var(--prompt-width, 50px);
            padding: 9px 0;

            text-align: center;

            color: var(--theme-cell-prompt-fg, black);
            background-color: var(--theme-cell-prompt-bg, #fafafa);

            flex: 0 0 auto;
          }

          .input-container :global(.input) {
            flex: 1 1 auto;
            overflow: auto;
            background-color: var(--theme-cell-input-bg, #fafafa);
          }
        `}</style>
      </div>
    );
  }
}

export const Cell = (props: { isSelected: boolean, children?: React.Node }) => {
  const children = props.children;
  return (
    <div className={`cell ${props.isSelected ? "focused" : ""}`}>
      <style jsx>{`
        .cell {
          position: relative;
          background: var(--theme-cell-bg, white);
          transition: all 0.1s ease-in-out;
        }

        .cell:hover {
          box-shadow: var(--theme-cell-shadow-hover);
        }

        .cell.focused {
          box-shadow: var(--theme-cell-shadow-focus);
        }

        .cell:hover :global(.prompt),
        .cell:active :global(.prompt) {
          background-color: var(--theme-cell-prompt-bg-hover);
          color: var(--theme-cell-prompt-fg-hover);
        }

        .cell:focus :global(.prompt),
        .cell.focused :global(.prompt) {
          background-color: var(--theme-cell-prompt-bg-focus);
          color: var(--theme-cell-prompt-fg-focus);
        }
      `}</style>
      {children}
    </div>
  );
};

Cell.defaultProps = {
  isSelected: false,
  children: null
};

export const Cells = (props: {
  children: React.ChildrenArray<any>,
  selected: string | null
}) => {
  return (
    <div className="cells">
      <style jsx>{`
        .cells > :global(*) {
          margin: 20px;
        }

        .cells {
          font-family: "Source Sans Pro", Helvetica Neue, Helvetica, Arial,
            sans-serif;
          font-size: 16px;
          background-color: var(--theme-app-bg);
          color: var(--theme-app-fg);

          padding-bottom: 10px;
        }
      `}</style>
      {props.children}
    </div>
  );
};

Cells.defaultProps = {
  children: [],
  selected: null
};
