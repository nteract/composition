/* @flow */

/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";
import CodeMirror from "../../providers/editor";

import LatexRenderer from "../latex";
import { Display, RichestMime } from "@nteract/display-area";

import MarkdownCell from "./markdown-cell";
import Toolbar from "../../providers/toolbar";

import { Input, Prompt, Editor, Pagers, Outputs, Cell } from "../ng";

import {
  focusCell,
  focusPreviousCell,
  focusNextCell,
  focusCellEditor,
  focusPreviousCellEditor,
  focusNextCellEditor
} from "../../actions";

// NOTE: PropTypes are required for the sake of contextTypes
const PropTypes = require("prop-types");

export type CellProps = {
  cell: any,
  displayOrder: Array<string>,
  id: string,
  cellFocused: string,
  editorFocused: string,
  language: string,
  running: boolean,
  theme: string,
  pagers: ImmutableList<any>,
  transforms: Object,
  models: ImmutableMap<string, any>
};

export class ConnectedCell extends React.PureComponent<CellProps, *> {
  selectCell: () => void;
  focusAboveCell: () => void;
  focusBelowCell: () => void;
  focusCellEditor: () => void;
  cellDiv: ?HTMLElement;
  scrollIntoViewIfNeeded: Function;

  static defaultProps = {
    pagers: new ImmutableList()
  };

  static contextTypes = {
    store: PropTypes.object
  };

  constructor(): void {
    super();
    this.selectCell = this.selectCell.bind(this);
    this.focusCellEditor = this.focusCellEditor.bind(this);
    this.focusAboveCell = this.focusAboveCell.bind(this);
    this.focusBelowCell = this.focusBelowCell.bind(this);
    this.scrollIntoViewIfNeeded = this.scrollIntoViewIfNeeded.bind(this);
  }

  componentDidUpdate(prevProps: CellProps) {
    this.scrollIntoViewIfNeeded(prevProps.cellFocused);
  }

  componentDidMount(): void {
    this.scrollIntoViewIfNeeded();
  }

  scrollIntoViewIfNeeded(prevCellFocused?: string): void {
    // If the previous cell that was focused was not us, we go ahead and scroll

    // Check if the .cell div is being hovered over.
    const hoverCell =
      this.cellDiv &&
      this.cellDiv.parentElement &&
      this.cellDiv.parentElement.querySelector(":hover") === this.cellDiv;

    if (
      this.props.cellFocused &&
      this.props.cellFocused === this.props.id &&
      prevCellFocused !== this.props.cellFocused &&
      // Don't scroll into view if already hovered over, this prevents
      // accidentally selecting text within the codemirror area
      !hoverCell
    ) {
      if (this.cellDiv && "scrollIntoViewIfNeeded" in this.cellDiv) {
        // $FlowFixMe: This is only valid in Chrome, WebKit
        this.cellDiv.scrollIntoViewIfNeeded();
      } else {
        // TODO: Polyfill as best we can for the webapp version
      }
    }
  }

  selectCell(): void {
    this.context.store.dispatch(focusCell(this.props.id));
  }

  focusCellEditor(): void {
    this.context.store.dispatch(focusCellEditor(this.props.id));
  }

  focusAboveCell(): void {
    this.context.store.dispatch(focusPreviousCell(this.props.id));
    this.context.store.dispatch(focusPreviousCellEditor(this.props.id));
  }

  focusBelowCell(): void {
    this.context.store.dispatch(focusNextCell(this.props.id, true));
    this.context.store.dispatch(focusNextCellEditor(this.props.id));
  }

  render(): ?React$Element<any> {
    const cell = this.props.cell;
    const cellType = cell.get("cell_type");
    const cellFocused = this.props.cellFocused === this.props.id;
    const editorFocused = this.props.editorFocused === this.props.id;

    let element = null;

    switch (cellType) {
      case "code":
        const sourceHidden =
          cell.getIn(["metadata", "inputHidden"], false) ||
          cell.getIn(["metadata", "hide_input"], false);

        const outputHidden =
          cell.get("outputs").size === 0 ||
          cell.getIn(["metadata", "outputHidden"]);
        const outputExpanded = cell.getIn(["metadata", "outputExpanded"]);

        element = (
          <div>
            <Input hidden={sourceHidden}>
              <Prompt
                counter={this.props.cell.get("execution_count")}
                running={this.props.running}
              />
              <Editor>
                <CodeMirror
                  tip
                  completion
                  id={this.props.id}
                  input={this.props.cell.get("source")}
                  language={this.props.language}
                  cellFocused={cellFocused}
                  editorFocused={editorFocused}
                  theme={this.props.theme}
                  focusAbove={this.focusAboveCell}
                  focusBelow={this.focusBelowCell}
                />
              </Editor>
            </Input>
            <Pagers>
              {this.props.pagers.map((pager, key) => (
                <RichestMime
                  expanded
                  className="pager"
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  bundle={pager}
                  theme={this.props.theme}
                  key={key}
                />
              ))}
            </Pagers>
            <LatexRenderer>
              <Outputs
                hidden={outputHidden}
                expanded={cell.getIn(["metadata", "outputExpanded"], true)}
              >
                <Display
                  className="outputs-display"
                  outputs={this.props.cell.get("outputs").toJS()}
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  theme={this.props.theme}
                  expanded={outputExpanded}
                  isHidden={outputHidden}
                  models={this.props.models.toJS()}
                />
              </Outputs>
            </LatexRenderer>
          </div>
        );

        break;
      case "markdown":
        element = (
          <MarkdownCell
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focusEditor={this.focusCellEditor}
            cellFocused={cellFocused}
            editorFocused={editorFocused}
            cell={cell}
            id={this.props.id}
            theme={this.props.theme}
          />
        );
        break;

      default:
        element = <pre>{cell.get("source")}</pre>;
        break;
    }

    return (
      <Cell id={this.props.id} isSelected={cellFocused}>
        <div
          onClick={this.selectCell}
          role="presentation"
          ref={el => {
            this.cellDiv = el;
          }}
        >
          <Toolbar type={cellType} cell={cell} id={this.props.id} />
          {element}
        </div>
      </Cell>
    );
  }
}

export default ConnectedCell;
