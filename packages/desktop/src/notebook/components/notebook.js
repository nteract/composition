/* eslint-disable no-return-assign */
/* @flow */
import React from "react";
import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import { displayOrder, transforms } from "@nteract/transforms-full";

import Cell from "./cell/cell";
import DraggableCell from "../providers/draggable-cell";
import CellCreator from "../providers/cell-creator";
import StatusBar from "./status-bar";
import {
  focusNextCell,
  focusNextCellEditor,
  moveCell,
  executeCell
} from "../actions";
import type { CellProps } from "./cell/cell";

// TODO: Remove after provider refactor finished
const PropTypes = require("prop-types");

type Props = {
  displayOrder: Array<string>,
  notebook: any,
  transforms: Object,
  cellPagers: ImmutableMap<string, any>,
  stickyCells: ImmutableMap<string, any>,
  transient: ImmutableMap<string, any>,
  cellFocused: string,
  editorFocused: string,
  theme: string,
  lastSaved: Date,
  kernelSpecDisplayName: string,
  CellComponent: any,
  executionState: string,
  models: ImmutableMap<string, any>
};

export function getLanguageMode(notebook: any): string {
  // The syntax highlighting language should be set in the language info
  // object.  First try codemirror_mode, then name, and fallback on 'null'.
  const language = notebook.getIn(
    ["metadata", "language_info", "codemirror_mode", "name"],
    notebook.getIn(
      ["metadata", "language_info", "codemirror_mode"],
      notebook.getIn(["metadata", "language_info", "name"], "text")
    )
  );
  return language;
}

const mapStateToProps = (state: Object) => ({
  theme: state.config.get("theme"),
  lastSaved: state.app.get("lastSaved"),
  kernelSpecDisplayName: state.app.get("kernelSpecDisplayName"),
  notebook: state.document.get("notebook"),
  transient: state.document.get("transient"),
  cellPagers: state.document.get("cellPagers"),
  cellFocused: state.document.get("cellFocused"),
  editorFocused: state.document.get("editorFocused"),
  stickyCells: state.document.get("stickyCells"),
  executionState: state.app.get("executionState"),
  models: state.comms.get("models")
});

export class Notebook extends React.PureComponent {
  props: Props;
  createCellElement: (s: string) => ?React.Element<any>;
  createStickyCellElement: (s: string) => ?React.Element<any>;
  keyDown: (e: KeyboardEvent) => void;
  moveCell: (source: string, dest: string, above: boolean) => void;
  stickyCellsPlaceholder: HTMLElement;
  stickyCellContainer: HTMLElement;
  cellElements: ImmutableMap<string, any>;

  static defaultProps = {
    displayOrder,
    transforms,
    CellComponent: DraggableCell
  };

  static contextTypes = {
    store: PropTypes.object
  };

  constructor(): void {
    super();
    this.createCellElement = this.createCellElement.bind(this);
    this.createStickyCellElement = this.createStickyCellElement.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.moveCell = this.moveCell.bind(this);
    this.cellElements = new ImmutableMap();
  }

  componentDidMount(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  componentDidUpdate(): void {
    if (this.stickyCellsPlaceholder) {
      // Make sure the document is vertically shifted so the top non-stickied
      // cell is always visible.
      this.stickyCellsPlaceholder.style.height = `${this.stickyCellContainer
        .clientHeight}px`;
    }
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  moveCell(sourceId: string, destinationId: string, above: boolean): void {
    this.context.store.dispatch(moveCell(sourceId, destinationId, above));
  }

  keyDown(e: KeyboardEvent): void {
    // If enter is not pressed, do nothing
    if (e.keyCode !== 13) {
      return;
    }

    let ctrlKeyPressed = e.ctrlKey;
    // Allow cmd + enter (macOS) to operate like ctrl + enter
    if (process.platform === "darwin") {
      ctrlKeyPressed = (e.metaKey || e.ctrlKey) && !(e.metaKey && e.ctrlKey);
    }

    const shiftXORctrl =
      (e.shiftKey || ctrlKeyPressed) && !(e.shiftKey && ctrlKeyPressed);
    if (!shiftXORctrl) {
      return;
    }

    if (!this.props.cellFocused) {
      return;
    }

    e.preventDefault();

    const cellMap = this.props.notebook.get("cellMap");
    const id = this.props.cellFocused;
    const cell = cellMap.get(id);

    if (e.shiftKey) {
      this.context.store.dispatch(focusNextCell(this.props.cellFocused, true));
      this.context.store.dispatch(focusNextCellEditor(id));
    }

    if (cell.get("cell_type") === "code") {
      this.context.store.dispatch(executeCell(id, cell.get("source")));
    }
  }

  createCellProps(id: string, cell: any, transient: any): CellProps {
    return {
      id,
      cell,
      language: getLanguageMode(this.props.notebook),
      key: id,
      ref: el => {
        this.cellElements = this.cellElements.set(id, el);
      },
      displayOrder: this.props.displayOrder,
      transforms: this.props.transforms,
      moveCell: this.moveCell,
      pagers: this.props.cellPagers.get(id),
      cellFocused: this.props.cellFocused,
      editorFocused: this.props.editorFocused,
      running: transient.get("status") === "busy",
      // Theme is passed through to let the Editor component know when to
      // tell CodeMirror to remeasure
      theme: this.props.theme,
      models: this.props.models
    };
  }

  createCellElement(id: string): ?React.Element<any> {
    const cellMap = this.props.notebook.get("cellMap");
    const cell = cellMap.get(id);
    const transient = this.props.transient.getIn(
      ["cellMap", id],
      new ImmutableMap()
    );
    const isStickied = this.props.stickyCells.get(id);

    const CellComponent = this.props.CellComponent;

    return (
      <div className="cell-container" key={`cell-container-${id}`}>
        {isStickied
          ? <div className="cell-placeholder">
              <span className="octicon octicon-link-external" />
            </div>
          : <CellComponent {...this.createCellProps(id, cell, transient)} />}
        <CellCreator key={`creator-${id}`} id={id} above={false} />
      </div>
    );
  }

  createStickyCellElement(id: string): ?React.Element<any> {
    const cellMap = this.props.notebook.get("cellMap");
    const transient = this.props.transient.getIn(
      ["cellMap", id],
      new ImmutableMap()
    );
    const cell = cellMap.get(id);
    return (
      <div key={`cell-container-${id}`}>
        <Cell {...this.createCellProps(id, cell, transient)} />
      </div>
    );
  }

  render(): ?React.Element<any> {
    if (!this.props.notebook) {
      return <div className="notebook" />;
    }
    const cellOrder = this.props.notebook.get("cellOrder");
    return (
      <div>
        <div className="notebook">
          <div
            className="sticky-cells-placeholder"
            ref={ref => {
              this.stickyCellsPlaceholder = ref;
            }}
          />
          <div
            className="sticky-cell-container"
            ref={ref => {
              this.stickyCellContainer = ref;
            }}
          >
            {cellOrder
              .filter(id => this.props.stickyCells.get(id))
              .map(this.createStickyCellElement)}
          </div>
          <CellCreator id={cellOrder.get(0, null)} above />
          {cellOrder.map(this.createCellElement)}
        </div>
        <StatusBar
          notebook={this.props.notebook}
          lastSaved={this.props.lastSaved}
          kernelSpecDisplayName={this.props.kernelSpecDisplayName}
          executionState={this.props.executionState}
        />
        <link
          rel="stylesheet"
          href={`../static/styles/theme-${this.props.theme}.css`}
        />
      </div>
    );
  }
}

export const ConnectedNotebook = dragDropContext(HTML5Backend)(Notebook);
export default connect(mapStateToProps)(ConnectedNotebook);
