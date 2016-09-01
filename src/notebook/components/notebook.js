import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { DragDropContext as dragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';

import Immutable from 'immutable';

import {
  defaultDisplayOrder as displayOrder,
  defaultTransforms as transforms,
} from './transforms';

import Cell from './cell/cell';
import DraggableCell from './cell/draggable-cell';
import CellCreator from './cell/cell-creator';
import {
  focusNextCell,
  moveCell,
  copyCell,
  pasteCell,
} from '../actions';
import { executeCell } from '../epics/execute';

import complete from '../kernel/completion';

// Always set up the markdown mode
require('codemirror/mode/markdown/markdown');

const mapStateToProps = (state) => ({
  theme: state.document.theme,
  notebook: state.document.get('notebook'),
  channels: state.app.channels,
  cellPagers: state.document.get('cellPagers'),
  focusedCell: state.document.get('focusedCell'),
  cellStatuses: state.document.get('cellStatuses'),
  stickyCells: state.document.get('stickyCells'),
  notificationSystem: state.app.notificationSystem,
});

class Notebook extends React.Component {
  static propTypes = {
    channels: React.PropTypes.any,
    dispatch: React.PropTypes.func,
    displayOrder: React.PropTypes.instanceOf(Immutable.List),
    notebook: React.PropTypes.any,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
    cellPagers: React.PropTypes.instanceOf(Immutable.Map),
    cellStatuses: React.PropTypes.instanceOf(Immutable.Map),
    stickyCells: React.PropTypes.instanceOf(Immutable.Map),
    focusedCell: React.PropTypes.string,
    theme: React.PropTypes.string,
    notificationSystem: React.PropTypes.any,
  };

  static defaultProps = {
    displayOrder,
    transforms,
  };

  static propsTypes = {
    dispatch: React.PropTypes.func,
    notificationSystem: React.PropTypes.any,
  };

  constructor() {
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.languageCache = {};
    this.createCellElement = this.createCellElement.bind(this);
    this.createStickyCellElement = this.createStickyCellElement.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.moveCell = this.moveCell.bind(this);
    this.getCompletions = this.getCompletions.bind(this);
    this.copyCell = this.copyCell.bind(this);
    this.pasteCell = this.pasteCell.bind(this);
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
    const placeholder = ReactDOM.findDOMNode(this.refs['sticky-cells-placeholder']);
    const container = ReactDOM.findDOMNode(this.refs['sticky-cell-container']);
    placeholder.style.height = `${container.clientHeight}px`;
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyDown);
  }

  getCompletions(source, cursor) {
    return complete(this.props.channels, source, cursor);
  }

  getLanguageMode() {
    // The syntax highlighting language should be set in the language info
    // object.  First try codemirror_mode, then name, and fallback on 'null'.
    let language =
      this.props.notebook.getIn(['metadata', 'language_info', 'codemirror_mode', 'name'],
      this.props.notebook.getIn(['metadata', 'language_info', 'codemirror_mode'],
      this.props.notebook.getIn(['metadata', 'language_info', 'name'],
      'text')));

    // TODO: Load the ipython codemirror mode from somewhere
    if (language === 'ipython') {
      language = 'python';
    }

    if (language !== 'text' && !this.languageCache[language]) {
      this.languageCache[language] = true;

      // HACK: This should give you the heeby-jeebies
      // Mostly because language could be ../../../../whatever
      // This is the notebook though, so hands off
      // We'll want to check for this existing later
      // and any other validation
      require(`codemirror/mode/${language}/${language}`); // eslint-disable-line global-require
    }
    return language;
  }

  moveCell(sourceId, destinationId, above) {
    this.props.dispatch(moveCell(sourceId, destinationId, above));
  }

  copyCell() {
    this.props.dispatch(copyCell(this.props.focusedCell));
  }

  pasteCell() {
    this.props.dispatch(pasteCell());
  }


  keyDown(e) {
    if (e.keyCode !== 13) {
      const cmdOrCtrl = e.ctrlKey || e.metaKey;
      if (cmdOrCtrl && e.shiftKey && e.keyCode === 67) {
        this.copyCell();
      } else if (cmdOrCtrl && e.shiftKey && e.keyCode === 86) {
        this.pasteCell();
      }
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
      this.props.dispatch(focusNextCell(this.props.focusedCell, true));
    }

    if (cell.get('cell_type') === 'code') {
      this.props.dispatch(
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

    const focusedCell = ReactDOM.findDOMNode(this.refs[id]);

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
      language: this.getLanguageMode(),
      getCompletions: this.getCompletions,
      key: id,
      ref: id,
      displayOrder: this.props.displayOrder,
      cellStatus: this.props.cellStatuses.get(id),
      transforms: this.props.transforms,
      moveCell: this.moveCell,
      pagers: this.props.cellPagers.get(id),
      focusedCell: this.props.focusedCell,
      running: this.props.cellStatuses.getIn([id, 'status']) === 'busy',
      theme: this.props.theme,
    };
  }

  createCellElement(id) {
    const cellMap = this.props.notebook.get('cellMap');
    const cell = cellMap.get(id);
    const isStickied = this.props.stickyCells.get(id);
    return (
      <div key={`cell-container-${id}`} ref="container">
        {isStickied ?
          <div className="cell-placeholder">
            <span className="octicon octicon-link-external" />
          </div> :
          <DraggableCell {...this.createCellProps(id, cell)} />}
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
      <div className="notebook" ref="cells">
        <div className="sticky-cells-placeholder" ref="sticky-cells-placeholder" />
        <div className="sticky-cell-container" ref="sticky-cell-container">
          {cellOrder
            .filter(id => this.props.stickyCells.get(id))
            .map(this.createStickyCellElement)}
        </div>
        <CellCreator id={cellOrder.get(0, null)} above />
        {cellOrder.map(this.createCellElement)}
      </div>
    );
  }
}

export const ConnectedNotebook = dragDropContext(HTML5Backend)(Notebook);
export default connect(mapStateToProps)(ConnectedNotebook);
