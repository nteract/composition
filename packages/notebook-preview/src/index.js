/* @flow */
import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import CommonMark from "commonmark";
import MarkdownRenderer from "commonmark-react-renderer";

import { Display } from "@nteract/display-area";
import { displayOrder, transforms } from "@nteract/transforms";

import { emptyNotebook, appendCellToNotebook } from "@nteract/commutable";
import { createCodeCell } from "@nteract/commutable/lib/structures";

import { _nextgen } from "@nteract/core/components";

import LatexRenderer from "./latex";
import { PapermillView } from "./papermill";

const {
  Cell,
  Input,
  Prompt,
  PromptBuffer,
  Editor,
  Outputs,
  Notebook
} = _nextgen;

const themes = require("@nteract/core/themes");

type MDRender = (input: string) => string;

const parser = new CommonMark.Parser();
const renderer = new MarkdownRenderer();

const mdRender: MDRender = input => renderer.render(parser.parse(input));

type Props = {
  displayOrder: Array<string>,
  notebook: any,
  transforms: Object,
  theme: string
};

export class NotebookPreview extends React.PureComponent<Props> {
  static defaultProps = {
    displayOrder,
    transforms,
    notebook: appendCellToNotebook(
      emptyNotebook,
      createCodeCell().set("source", "test")
    ),
    theme: "light"
  };

  render(): ?React$Element<any> {
    // TODO: Rely on setState to convert notebook from plain JS to commutable format

    const notebook = this.props.notebook;

    // Propagated from the hide_(all)_input nbextension
    const allSourceHidden = notebook.getIn(["metadata", "hide_input"], false);

    const language = notebook.getIn(
      ["metadata", "language_info", "codemirror_mode", "name"],
      notebook.getIn(
        ["metadata", "language_info", "codemirror_mode"],
        notebook.getIn(["metadata", "language_info", "name"], "text")
      )
    );

    const cellOrder = notebook.get("cellOrder");
    const cellMap = notebook.get("cellMap");

    return (
      <div className="notebook-preview">
        <Notebook>
          {cellOrder.map(cellID => {
            const cell = cellMap.get(cellID);
            const cellType = cell.get("cell_type");
            const source = cell.get("source");

            switch (cellType) {
              case "code":
                const sourceHidden =
                  allSourceHidden ||
                  cell.getIn(["metadata", "inputHidden"]) ||
                  cell.getIn(["metadata", "hide_input"]);

                const outputHidden =
                  cell.get("outputs").size === 0 ||
                  cell.getIn(["metadata", "outputHidden"]);

                return (
                  <Cell key={cellID}>
                    <PapermillView
                      {...cell
                        .getIn(["metadata", "papermill"], ImmutableMap())
                        .toJS()}
                    />
                    <Input hidden={sourceHidden}>
                      <Prompt />
                      <Editor language={language} theme={this.props.theme}>
                        {source}
                      </Editor>
                    </Input>
                    <Outputs
                      hidden={outputHidden}
                      expanded={cell.getIn(
                        ["metadata", "outputExpanded"],
                        true
                      )}
                    >
                      <Display
                        outputs={cell.get("outputs").toJS()}
                        transforms={transforms}
                        displayOrder={displayOrder}
                      />
                    </Outputs>
                  </Cell>
                );
              case "markdown":
                return (
                  <Cell key={cellID}>
                    <div className="content-margin">
                      {/* TODO: embed mathjax on the page here, otherwise LaTeX
                              rendering doesn't actually happen
                    */}
                      <LatexRenderer>{mdRender(source)}</LatexRenderer>
                    </div>
                    <style jsx>{`
                      .content-margin {
                        padding-left: calc(var(--prompt-width, 50px) + 10px);
                        padding-top: 10px;
                        padding-bottom: 10px;
                        padding-right: 10px;
                      }
                    `}</style>
                  </Cell>
                );
              case "raw":
                return (
                  <Cell key={cellID}>
                    <pre className="raw-cell">
                      {source}
                      <style jsx>{`
                        raw-cell {
                          background: repeating-linear-gradient(
                            -45deg,
                            transparent,
                            transparent 10px,
                            #efefef 10px,
                            #f1f1f1 20px
                          );
                        }
                      `}</style>
                    </pre>
                  </Cell>
                );

              default:
                return (
                  <Cell key={cellID}>
                    <Outputs>
                      <pre>{`Cell Type "${cellType}" is not implemented`}</pre>
                    </Outputs>
                  </Cell>
                );
            }
          })}
        </Notebook>
        <style>{`:root {
          ${themes[this.props.theme]}
            --cell-shadow-hover-1: none;
            --cell-shadow-hover-2: none;
            --cell-shadow-focus-1: none;
            --cell-shadow-focus-2: none;
            --cell-bg-hover: var(--prompt-bg);
            --cell-bg-focus: var(--prompt-bg);
          }
        `}</style>
      </div>
    );
  }
}

export default NotebookPreview;
