/* eslint-disable no-return-assign */
/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';
import { DragDropContext as dragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';

import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import './cell/editor/codemirror-ipython';

import {
  displayOrder,
  transforms,
} from './transforms';

import Cell from './cell/cell';
import DraggableCell from './cell/draggable-cell';
import CellCreator from './cell/cell-creator';
import StatusBar from './status-bar';
import {
  focusNextCell,
  moveCell,
  executeCell,
} from '../actions';
import type { CellProps } from './cell/cell';

// Always set up the markdown modes
require('codemirror/mode/markdown/markdown');
require('codemirror/mode/gfm/gfm');

// Common languages
require('codemirror/mode/python/python');
require('codemirror/mode/ruby/ruby');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/r/r');
require('codemirror/mode/julia/julia');

// Scala
require('codemirror/mode/clike/clike');

require('codemirror/mode/shell/shell');
require('codemirror/mode/sql/sql');

type Props = {
  displayOrder: ImmutableList<any>,
  notebook: any,
  transforms: ImmutableMap<string, any>,
  cellPagers: ImmutableMap<string, any>,
  stickyCells: ImmutableMap<string, any>,
  focusedCell: string,
  theme: string,
  lastSaved: Date,
  kernelSpecName: string,
  CellComponent: any,
  executionState: string,
  session: string,
};

export function getLanguageMode(notebook: any): string {
  // The syntax highlighting language should be set in the language info
  // object.  First try codemirror_mode, then name, and fallback on 'null'.
  const language =
    notebook.getIn(['metadata', 'language_info', 'codemirror_mode', 'name'],
    notebook.getIn(['metadata', 'language_info', 'codemirror_mode'],
    notebook.getIn(['metadata', 'language_info', 'name'],
    'text')));
  return language;
}
/**
 * Provide the appropriate position to scroll to when given cell position and size
 * information.
 * @param  {HTMLElement} el - Element to be compared against window and body for
 * scrollTop value.
 * @return {Integer} - An integer for the new document scrollTop value.
 */
export function scrollToElement(el: HTMLElement): number {
  const viewportHeight = window.innerHeight;
  const viewportOffset = document.body.scrollTop;

  const cellTop = el.offsetTop;
  const cellHeight = el.offsetHeight;

  const belowFold = (cellTop + cellHeight) > (viewportOffset + viewportHeight);
  const aboveFold = cellTop < viewportOffset;

  if (aboveFold) {
    return cellTop;
  }

  if (belowFold) {
    if (cellHeight > viewportHeight) {
      return cellTop;
    }
    const offset = viewportHeight - cellHeight;
    return cellTop - offset;
  }
  return document.body.scrollTop;
}

const mapStateToProps = (state: Object) => ({
  theme: state.config.get('theme'),
  lastSaved: state.app.get('lastSaved'),
  kernelSpecName: state.app.get('kernelSpecName'),
  notebook: state.document.get('notebook'),
  cellPagers: state.document.get('cellPagers'),
  focusedCell: state.document.get('focusedCell'),
  stickyCells: state.document.get('stickyCells'),
  executionState: state.app.get('executionState'),
  session: state.app.get('sessionId'),
});

export class Notebook extends React.Component {
  props: Props;
  shouldComponentUpdate: (p: Props, s: any) => boolean;
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
    CellComponent: DraggableCell,
  };

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(): void {
    super();
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.createCellElement = this.createCellElement.bind(this);
    this.createStickyCellElement = this.createStickyCellElement.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.moveCell = this.moveCell.bind(this);
    this.cellElements = new ImmutableMap();
  }

  componentDidMount(): void {
    document.addEventListener('keydown', this.keyDown);
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.focusedCell !== this.props.focusedCell) {
      this.resolveScrollPosition(nextProps.focusedCell);
    }
  }

  componentDidUpdate(): void {
    if (this.stickyCellsPlaceholder) {
      // Make sure the document is vertically shifted so the top non-stickied
      // cell is always visible.
      this.stickyCellsPlaceholder.style.height =
        `${this.stickyCellContainer.clientHeight}px`;
    }
  }

  componentWillUnmount(): void {
    document.removeEventListener('keydown', this.keyDown);
  }

  moveCell(sourceId: string, destinationId: string, above: boolean): void {
    this.context.store.dispatch(moveCell(sourceId, destinationId, above));
  }

  keyDown(e: KeyboardEvent): void {
    if (e.keyCode !== 13) {
      return;
    }

    const shiftXORctrl = (e.shiftKey || e.ctrlKey) && !(e.shiftKey && e.ctrlKey);
    if (!shiftXORctrl) {
      return;
    }

    if (!this.props.focusedCell) {
      return;
    }

    e.preventDefault();

    const cellMap = this.props.notebook.get('cellMap');
    const id = this.props.focusedCell;
    const cell = cellMap.get(id);

    if (e.shiftKey) {
      this.context.store.dispatch(focusNextCell(this.props.focusedCell, true));
    }

    if (cell.get('cell_type') === 'code') {
      this.context.store.dispatch(
        executeCell(
          id,
          cell.get('source')
        )
      );
    }
  }

  resolveScrollPosition(id: string): void {
    const focusedCell = this.cellElements.get(id);
    if (focusedCell) {
      document.body.scrollTop = scrollToElement(focusedCell);
    }
  }

  createCellProps(id: string, cell: any): CellProps {
    return {
      id,
      cell,
      language: getLanguageMode(this.props.notebook),
      key: id,
      ref: (el) => { this.cellElements = this.cellElements.set(id, el); },
      displayOrder: this.props.displayOrder,
      transforms: this.props.transforms,
      moveCell: this.moveCell,
      pagers: this.props.cellPagers.get(id),
      focusedCell: this.props.focusedCell,
      running: cell.get('status') === 'busy',
      // Theme is passed through to let the Editor component know when to
      // tell CodeMirror to remeasure
      theme: this.props.theme,
      session: this.props.session,
    };
  }

  createCellElement(id: string): ?React.Element<any> {
    const cellMap = this.props.notebook.get('cellMap');
    const cell = cellMap.get(id);
    const isStickied = this.props.stickyCells.get(id);

    const CellComponent = this.props.CellComponent;

    return (
      <div key={`cell-container-${id}`}>
        {isStickied ?
          <div className="cell-placeholder">
            <span className="octicon octicon-link-external" />
          </div> :
            <CellComponent {...this.createCellProps(id, cell)} />}
        <CellCreator key={`creator-${id}`} id={id} above={false} />
      </div>);
  }

  createStickyCellElement(id: string): ?React.Element<any> {
    const cellMap = this.props.notebook.get('cellMap');
    const cell = cellMap.get(id);
    return (
      <div key={`cell-container-${id}`}>
        <Cell {...this.createCellProps(id, cell)} />
      </div>);
  }

  render(): ?React.Element<any> {
    if (!this.props.notebook) {
      return (
        <div className="notebook" />
      );
    }
    const cellOrder = this.props.notebook.get('cellOrder');
    return (
      <div>
        <div className="notebook">
          <div
            className="sticky-cells-placeholder"
            ref={(ref) => { this.stickyCellsPlaceholder = ref; }}
          />
          <div
            className="sticky-cell-container"
            ref={(ref) => { this.stickyCellContainer = ref; }}
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
          kernelSpecName={this.props.kernelSpecName}
          executionState={this.props.executionState}
        />
        <link rel="stylesheet" href={`../static/styles/theme-${this.props.theme}.css`} />
      </div>
    );
  }
}

export const ConnectedNotebook = dragDropContext(HTML5Backend)(Notebook);
export default connect(mapStateToProps)(ConnectedNotebook);
