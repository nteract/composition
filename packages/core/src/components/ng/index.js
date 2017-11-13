// @flow
import * as React from "react";

import SyntaxHighlighter from "react-syntax-highlighter";
import { idea, agate } from "react-syntax-highlighter/dist/styles";

export const Output = () => <pre>I am output</pre>;

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

            .outputs :global(table) {
              border-collapse: collapse;
            }

            .outputs :global(th),
            .outputs :global(td) {
              padding: 0.5em 1em;
              border: 1px solid var(--primary-border, #cbcbcb);
            }

            .outputs :global(th) {
              text-align: left;
            }

            .outputs :global(blockquote) {
              padding: 0.75em 0.5em 0.75em 1em;
              background: var(--main-bg-color, white);
              border-left: 0.5em solid #ddd;
            }

            .outputs :global(.blockquote::before) {
              display: block;
              height: 0;
              content: "“";
              margin-left: -0.95em;
              font: italic 400%/1 Open Serif, Georgia, "Times New Roman", serif;
              color: solid var(--primary-border, #cbcbcb);
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

export type EditorProps = {
  language: string,
  children: string | React.Element<any>,
  className?: string,
  theme: "light" | "dark"
};

function selectHighlighterStyle(theme: string = "light") {
  switch (theme) {
    case "light":
      return idea;
    case "dark":
      return agate;
    default:
      return idea;
  }
}

export class Editor extends React.Component<EditorProps> {
  static defaultProps = {
    children: "",
    language: "python",
    className: "input",
    theme: "light"
  };

  render() {
    // Build in a default renderer when they pass a plain string
    if (typeof this.props.children === "string") {
      return (
        <SyntaxHighlighter
          style={selectHighlighterStyle(this.props.theme)}
          language={this.props.language}
          className={this.props.className}
          customStyle={{
            padding: "10px 0px 10px 10px",
            margin: "0px",
            backgroundColor: "var(--cm-background, #fafafa)"
          }}
        >
          {this.props.children}
        </SyntaxHighlighter>
      );
    }
    // Otherwise assume they have their own editor component
    return this.props.children;
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

            width: var(--prompt-width, 50px);
            padding: 9px 0;

            text-align: center;

            color: var(--input-color, black);
            background-color: var(--prompt-bg, #fafafa);

            flex: 0 0 auto;
          }

          .input-container :global(.input) {
            flex: 1 1 auto;
            overflow: auto;
            background-color: var(--cm-background, #fafafa);
          }
        `}</style>
      </div>
    );
  }
}

export const Cell = (props: {
  isSelected: boolean,
  children?: React.Node,
  id?: string
}) => {
  const children = props.children;
  return (
    <div className={`cell ${props.isSelected ? "focused" : ""}`}>
      <style jsx>{`
        .cell {
          position: relative;
          background: var(--cell-bg, white);
          transition: all 0.1s ease-in-out;
        }

        /*
         TODO: Create a "cell-hover-shadow" var and cell-focused-shadow var
         For now, assume that it will have to be overridden somehow.

         One issue we currently have is that these are each two properties.

         Basically it's
         --cell-shadow-hover-1 and --cell--shadow-hover-2
         */

        .cell:hover {
          /* prettier-ignore */
          box-shadow: var(--cell-shadow-hover-1,  1px  1px 3px rgba(0, 0, 0, 0.12)),
                      var(--cell-shadow-hover-2, -1px -1px 3px rgba(0, 0, 0, 0.12));
        }

        .cell.focused {
          /* prettier-ignore */
          box-shadow: var(--cell-focus-hover-1,  3px  3px 9px rgba(0, 0, 0, 0.12)),
                      var(--cell-focus-hover-2, -3px -3px 9px rgba(0, 0, 0, 0.12));
        }

        .cell:hover :global(.prompt),
        .cell:active :global(.prompt) {
          background-color: var(--cell-bg-hover, #eeedee);
        }

        .cell:focus :global(.prompt),
        .cell.focused :global(.prompt) {
          background-color: var(--cell-bg-focus, #e2dfe3);
        }
      `}</style>
      {children}
    </div>
  );
};

Cell.defaultProps = {
  isSelected: false,
  children: null,
  id: null
};

// For
export const Notebook = (props: {
  children: React.ChildrenArray<React.Element<typeof Cell>>,
  selected: string | null
}) => {
  const children = React.Children.map(props.children, child =>
    React.cloneElement(child, {
      // If there's a selection and it matches the cell's ID, mark isSelected
      isSelected: props.selected && child.props.id === props.selected
    })
  );
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
          background-color: var(--main-bg-color, white);
          color: var(--main-fg-color, rgb(51, 51, 51));

          padding-bottom: 10px;
        }
      `}</style>
      {children}
    </div>
  );
};

Notebook.defaultProps = {
  children: [],
  selected: null
};
