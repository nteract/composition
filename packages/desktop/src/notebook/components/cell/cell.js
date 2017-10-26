/* @flow */

/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import CodeCell from "./code-cell";
import MarkdownCell from "./markdown-cell";
import Toolbar from "../../providers/toolbar";

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

export class Cell extends React.PureComponent<CellProps, *> {
  selectCell: () => void;
  focusAboveCell: () => void;
  focusBelowCell: () => void;
  focusCellEditor: () => void;
  cellDiv: ?HTMLElement;
  scrollIntoViewIfNeeded: Function;

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

  addFocused(e): void {
    // Remove the focused class and event listener
    // if the user doesn't click a child of the .outputs div
    if (!this.outputsDiv.contains(e.target)) {
      this.outputsDiv.classList.remove("focused");
      window.removeEventListener("click", this.addFocused);
    }
  }

  clickedOutputs(outputsDiv): void {
    // Only add class and set event listener if they haven't been set yet
    if (!this.outputsDiv.classList.contains("focused")) {
      this.outputsDiv.classList.add("focused");
      // No need to bind because it is binded to this in child
      window.addEventListener("click", this.addFocused);
    }
  }

  render(): ?React$Element<any> {
    const cell = this.props.cell;
    const type = cell.get("cell_type");
    const cellFocused = this.props.cellFocused === this.props.id;
    const editorFocused = this.props.editorFocused === this.props.id;
    return (
      <div
        className={`cell ${type === "markdown" || type === "raw"
          ? "text"
          : "code"} ${cellFocused ? "focused" : ""}`}
        onClick={this.selectCell}
        role="presentation"
        ref={el => {
          this.cellDiv = el;
        }}
      >
        <Toolbar type={type} cell={cell} id={this.props.id} />
        {type === "markdown" ? (
          <MarkdownCell
            clickedOutputs={this.clickedOutputs}
            addFocused={this.addFocused}
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focusEditor={this.focusCellEditor}
            cellFocused={cellFocused}
            editorFocused={editorFocused}
            cell={cell}
            id={this.props.id}
            theme={this.props.theme}
          />
        ) : type === "code" ? (
          <CodeCell
            clickedOutputs={this.clickedOutputs}
            addFocused={this.addFocused}
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            cellFocused={cellFocused}
            editorFocused={editorFocused}
            cell={cell}
            id={this.props.id}
            theme={this.props.theme}
            language={this.props.language}
            displayOrder={this.props.displayOrder}
            transforms={this.props.transforms}
            pagers={this.props.pagers}
            running={this.props.running}
            models={this.props.models}
          />
        ) : (
          <pre>{cell.get("source")}</pre>
        )}
      </div>
    );
  }
}

export default Cell;
