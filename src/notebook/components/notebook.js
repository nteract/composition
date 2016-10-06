/* eslint-disable no-return-assign */
import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { DragDropContext as dragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';

import Immutable from 'immutable';

import './cell/editor/codemirror-ipython';

import {
  defaultDisplayOrder as displayOrder,
  defaultTransforms as transforms,
} from './transforms';

import Cell from './cell/cell';
import DraggableCell from './cell/draggable-cell';
import CellCreator from './cell/cell-creator';
import StatusBar from './status-bar';
import {
  focusNextCell,
  moveCell,
} from '../actions';
import { executeCell } from '../epics/execute';

// Always set up the markdown mode
require('codemirror/mode/markdown/markdown');

export function getLanguageMode(notebook) {
  // The syntax highlighting language should be set in the language info
  // object.  First try codemirror_mode, then name, and fallback on 'null'.
  const language =
    notebook.getIn(['metadata', 'language_info', 'codemirror_mode', 'name'],
    notebook.getIn(['metadata', 'language_info', 'codemirror_mode'],
    notebook.getIn(['metadata', 'language_info', 'name'],
    'text')));

  if (language !== 'ipython' && language !== 'text') {
    // HACK: This should give you the heeby-jeebies
    // Mostly because language could be ../../../../whatever
    // This is the notebook though, so hands off
    // We'll want to check for this existing later
    // and any other validation
    try {
      /* eslint-disable */
      require(`codemirror/mode/${language}/${language}`);
      /* eslint-enable */
    } catch (err) {
      /* istanbul ignore next */
      console.error(err);
    }
  }
  return language;
}

const mapStateToProps = (state) => ({
  theme: state.app.theme,
  lastSaved: state.app.get('lastSaved'),
  kernelSpecName: state.app.get('kernelSpecName'),
  notebook: state.document.get('notebook'),
  cellPagers: state.document.get('cellPagers'),
  focusedCell: state.document.get('focusedCell'),
  stickyCells: state.document.get('stickyCells'),
  executionState: state.app.get('executionState'),
});

export class Notebook extends React.Component {
  static propTypes = {
    displayOrder: React.PropTypes.instanceOf(Immutable.List),
    notebook: React.PropTypes.any,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
    cellPagers: React.PropTypes.instanceOf(Immutable.Map),
    stickyCells: React.PropTypes.instanceOf(Immutable.Map),
    focusedCell: React.PropTypes.string,
    theme: React.PropTypes.string,
    lastSaved: React.PropTypes.instanceOf(Date),
    kernelSpecName: React.PropTypes.string,
    CellComponent: React.PropTypes.any,
    executionState: React.PropTypes.string,
  };

  static defaultProps = {
    displayOrder,
    transforms,
    CellComponent: DraggableCell,
  };

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor() {
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.createCellElement = this.createCellElement.bind(this);
    this.createStickyCellElement = this.createStickyCellElement.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.moveCell = this.moveCell.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDown);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.focusedCell !== this.props.focusedCell) {
      this.resolveScrollPosition(nextProps.focusedCell);
    }
  }

  componentDidUpdate() {
    // Make sure the document is vertically shifted so the top non-stickied
    // cell is always visible.
    this.stickyCellsPlaceholder.style.height =
      `${this.stickyCellContainer.clientHeight}px`;
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDown);
  }

  moveCell(sourceId, destinationId, above) {
    this.context.store.dispatch(moveCell(sourceId, destinationId, above));
  }

  keyDown(e) {
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

  resolveScrollPosition(id) {
    const viewportHeight = window.innerHeight;
    const viewportOffset = document.body.scrollTop;

    const focusedCell = this.refs[id];

    if (focusedCell) {
      const cellTop = focusedCell.offsetTop;
      const cellHeight = focusedCell.offsetHeight;

      const belowFold = (cellTop + cellHeight) > (viewportOffset + viewportHeight);
      const aboveFold = cellTop < viewportOffset;

      if (aboveFold) {
        document.body.scrollTop = cellTop;
      }

      if (belowFold) {
        if (cellHeight > viewportHeight) {
          document.body.scrollTop = cellTop;
        } else {
          const offset = viewportHeight - cellHeight;
          document.body.scrollTop = cellTop - offset;
        }
      }
    }
  }

  createCellProps(id, cell) {
    return {
      id,
      cell,
      language: getLanguageMode(this.props.notebook),
      key: id,
      ref: id,
      displayOrder: this.props.displayOrder,
      transforms: this.props.transforms,
      moveCell: this.moveCell,
      pagers: this.props.cellPagers.get(id),
      focusedCell: this.props.focusedCell,
      running: cell.get('status') === 'busy',
      // Theme is passed through to let the Editor component know when to
      // tell CodeMirror to remeasure
      theme: this.props.theme,
    };
  }

  createCellElement(id) {
    const cellMap = this.props.notebook.get('cellMap');
    const cell = cellMap.get(id);
    const isStickied = this.props.stickyCells.get(id);

    const CellComponent = this.props.CellComponent;

    return (
      <div key={`cell-container-${id}`} ref="container">
        {isStickied ?
          <div className="cell-placeholder">
            <span className="octicon octicon-link-external" />
          </div> :
          <CellComponent {...this.createCellProps(id, cell)} />}
        <CellCreator key={`creator-${id}`} id={id} above={false} />
      </div>);
  }

  createStickyCellElement(id) {
    const cellMap = this.props.notebook.get('cellMap');
    const cell = cellMap.get(id);
    return (
      <div key={`cell-container-${id}`} ref="container">
        <Cell {...this.createCellProps(id, cell)} />
      </div>);
  }

  render() {
    if (!this.props.notebook) {
      return (
        <div className="notebook" />
      );
    }
    const cellOrder = this.props.notebook.get('cellOrder');
    return (
      <div>
        <div className="notebook" ref="cells">
          <div
            className="sticky-cells-placeholder"
            ref={(ref) => this.stickyCellsPlaceholder = ref}
          />
          <div
            className="sticky-cell-container"
            ref={(ref) => this.stickyCellContainer = ref}
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
