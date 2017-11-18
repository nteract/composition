/* eslint-disable no-return-assign */
/* @flow */
import * as React from "react";
import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import { displayOrder, transforms } from "@nteract/transforms";

import Cell from "../components/cell/cell";

import DraggableCell from "./draggable-cell";
import CellCreator from "../providers/cell-creator";
import StatusBar from "./status-bar";

import {
  focusNextCell,
  focusNextCellEditor,
  moveCell,
  focusCell,
  executeCell
} from "../actions";

import { LinkExternalOcticon } from "./octicons";

// NOTE: PropTypes are required for the sake of contextTypes
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
  executionState: string,
  models: ImmutableMap<string, any>,
  language: string
};

const PinnedPlaceHolderCell = () => (
  <div className="cell-placeholder">
    <span className="octicon">
      <LinkExternalOcticon />
    </span>
    <style jsx>{`
      .cell-placeholder {
        text-align: center;
        color: var(--main-fg-color);
        padding: 10px;
        opacity: var(--cell-placeholder-opacity);
      }

      .octicon {
        transition: color 0.5s;
      }
    `}</style>
  </div>
);

export function getLanguageMode(notebook: ImmutableMap<*, *>): string {
  if (!notebook) {
    return "text";
  }

  // First try codemirror_mode, then name, and fallback to 'text'
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
  notebook: state.document.get("notebook", ImmutableMap()),
  transient: state.document.get("transient"),
  cellPagers: state.document.get("cellPagers"),
  cellFocused: state.document.get("cellFocused"),
  editorFocused: state.document.get("editorFocused"),
  stickyCells: state.document.get("stickyCells"),
  executionState: state.app.get("executionState"),
  models: state.comms.get("models"),
  language: getLanguageMode(state.document.get("notebook", ImmutableMap()))
});

export class Notebook extends React.PureComponent<Props> {
  createCellElement: (s: string) => ?React$Element<any>;
  createStickyCellElement: (s: string) => ?React$Element<any>;
  keyDown: (e: KeyboardEvent) => void;
  moveCell: (source: string, dest: string, above: boolean) => void;
  selectCell: (id: string) => void;
  renderCell: (id: string) => React$Element<any>;
  stickyCellsPlaceholder: ?HTMLElement;
  stickyCellContainer: ?HTMLElement;

  static defaultProps = {
    displayOrder,
    transforms,
    language: "python"
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
    this.selectCell = this.selectCell.bind(this);
    this.renderCell = this.renderCell.bind(this);
  }

  componentDidMount(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.stickyCellsPlaceholder && this.stickyCellContainer) {
      // Make sure the document is vertically shifted so the top non-stickied
      // cell is always visible.
      this.stickyCellsPlaceholder.style.height = `${
        this.stickyCellContainer.clientHeight
      }px`;
    }
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  moveCell(sourceId: string, destinationId: string, above: boolean): void {
    this.context.store.dispatch(moveCell(sourceId, destinationId, above));
  }

  selectCell(id: string): void {
    this.context.store.dispatch(focusCell(id));
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

    if (e.shiftKey && !this.props.stickyCells.has(id)) {
      this.context.store.dispatch(focusNextCell(this.props.cellFocused, true));
      this.context.store.dispatch(focusNextCellEditor(id));
    }

    if (cell.get("cell_type") === "code") {
      this.context.store.dispatch(executeCell(id, cell.get("source")));
    }
  }

  renderStickyCells(): React.Node {
    const cellOrder = this.props.notebook.get("cellOrder", ImmutableList());
    // TODO: This could be part of map state to props
    const stickyCells = cellOrder.filter(id => this.props.stickyCells.get(id));

    return (
      <div>
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
          {stickyCells.map(this.createStickyCellElement)}
        </div>
        <style jsx>{`
          .sticky-cell-container {
            background: var(--main-bg-color);
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);

            top: 0px;
            position: fixed;
            z-index: 300;
            width: 100%;
            max-height: 50%;

            padding-bottom: 10px;
            padding-top: 20px;
            overflow: auto;
          }

          .sticky-cell-container:empty {
            display: none;
          }
        `}</style>
      </div>
    );
  }

  renderCell(id: string): React$Element<any> {
    const cellMap = this.props.notebook.get("cellMap");
    const cell = cellMap.get(id);
    const transient = this.props.transient.getIn(
      ["cellMap", id],
      new ImmutableMap()
    );

    return (
      <Cell
        cell={cell}
        displayOrder={this.props.displayOrder}
        id={id}
        cellFocused={this.props.cellFocused}
        editorFocused={this.props.editorFocused}
        language={this.props.language}
        running={transient.get("status") === "busy"}
        theme={this.props.theme}
        pagers={this.props.cellPagers.get(id)}
        transforms={this.props.transforms}
        models={this.props.models}
      />
    );
  }

  createCellElement(id: string): ?React$Element<any> {
    const isStickied = this.props.stickyCells.get(id);

    return (
      <div className="cell-container" key={`cell-container-${id}`}>
        {isStickied ? (
          <PinnedPlaceHolderCell />
        ) : (
          <DraggableCell
            moveCell={this.moveCell}
            id={id}
            selectCell={this.selectCell}
          >
            {this.renderCell(id)}
          </DraggableCell>
        )}
        <CellCreator key={`creator-${id}`} id={id} above={false} />
      </div>
    );
  }

  createStickyCellElement(id: string): ?React$Element<any> {
    return (
      <div className="cell-container" key={`cell-container-${id}`}>
        {this.renderCell(id)}
      </div>
    );
  }

  render(): ?React$Element<any> {
    if (!this.props.notebook) {
      return <div className="notebook" />;
    }
    const cellOrder = this.props.notebook.get("cellOrder");
    return (
      <div>
        <div className="notebook">
          {this.renderStickyCells()}
          <CellCreator id={cellOrder.get(0, null)} above />
          {/* Actual cells! */}
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
          // TODO: Tear this out or switch to styled-jsx for the inline setting here
          href={`../static/styles/theme-${this.props.theme}.css`}
        />
      </div>
    );
  }
}

export const ConnectedNotebook = dragDropContext(HTML5Backend)(Notebook);
export default connect(mapStateToProps)(ConnectedNotebook);
