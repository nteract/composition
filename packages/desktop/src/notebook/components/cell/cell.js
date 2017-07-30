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

// TODO: Remove after provider refactor finished
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

type State = {
  hoverCell: boolean
};

export class Cell extends React.PureComponent {
  props: CellProps;
  state: State;
  selectCell: () => void;
  focusAboveCell: () => void;
  focusBelowCell: () => void;
  focusCellEditor: () => void;
  setCellHoverState: (mouseEvent: MouseEvent) => void;
  cellDiv: HTMLElement;

  static contextTypes = {
    store: PropTypes.object
  };

  constructor(): void {
    super();
    this.selectCell = this.selectCell.bind(this);
    this.focusCellEditor = this.focusCellEditor.bind(this);
    this.focusAboveCell = this.focusAboveCell.bind(this);
    this.focusBelowCell = this.focusBelowCell.bind(this);
    this.setCellHoverState = this.setCellHoverState.bind(this);
  }

  state = {
    hoverCell: false
  };

  componentDidMount(): void {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    document.addEventListener("mousemove", this.setCellHoverState, false);
  }

  componentWillUnmount(): void {
    document.removeEventListener("mousemove", this.setCellHoverState);
  }

  setCellHoverState(mouseEvent: MouseEvent): void {
    const x = mouseEvent.clientX;
    const y = mouseEvent.clientY;
    const regionRect = this.cellDiv.getBoundingClientRect();
    const hoverCell =
      regionRect.left < x &&
      x < regionRect.right &&
      (regionRect.top < y && y < regionRect.bottom);

    if (this.state.hoverCell !== hoverCell) {
      this.setState({ hoverCell });
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

  render(): ?React.Element<any> {
    const cell = this.props.cell;
    const type = cell.get("cell_type");
    const cellFocused = this.props.cellFocused === this.props.id;
    const hoverCell = this.state.hoverCell;
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
        {cellFocused || hoverCell
          ? <Toolbar type={type} cell={cell} id={this.props.id} />
          : null}
        {type === "markdown"
          ? <MarkdownCell
              focusAbove={this.focusAboveCell}
              focusBelow={this.focusBelowCell}
              focusEditor={this.focusCellEditor}
              cellFocused={cellFocused}
              editorFocused={editorFocused}
              cell={cell}
              id={this.props.id}
              theme={this.props.theme}
            />
          : type === "code"
            ? <CodeCell
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
            : <pre>
                {cell.get("source")}
              </pre>}
      </div>
    );
  }
}

export default Cell;
