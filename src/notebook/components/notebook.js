import React from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext as dragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import DraggableCell from './cell/draggable-cell';
import CellCreator from './cell/cell-creator';
import { executeCell, focusNextCell, moveCell } from '../actions';

import complete from '../api/messaging/completion';

import Immutable from 'immutable';

import { displayOrder, transforms } from 'transformime-react';

// Always set up the markdown mode
require('codemirror/mode/markdown/markdown');

class Notebook extends React.Component {
  static propTypes = {
    channels: React.PropTypes.any,
    displayOrder: React.PropTypes.instanceOf(Immutable.List),
    notebook: React.PropTypes.any,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
    cellPagers: React.PropTypes.instanceOf(Immutable.Map),
    cellStatuses: React.PropTypes.instanceOf(Immutable.Map),
    focusedCell: React.PropTypes.string,
    theme: React.PropTypes.string,
  };

  static defaultProps = {
    displayOrder,
    transforms,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  static childContextTypes = {
    channels: React.PropTypes.object,
  };

  constructor() {
    super();
    this.languageCache = {};
    this.createCellElement = this.createCellElement.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.moveCell = this.moveCell.bind(this);
    this.getCompletions = this.getCompletions.bind(this);
  }

  getChildContext() {
    return {
      channels: this.props.channels,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDown);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.focusedCell !== this.props.focusedCell) {
      this.resolveScrollPosition(nextProps.focusedCell);
    }
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
    this.context.dispatch(moveCell(sourceId, destinationId, above));
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
      this.context.dispatch(focusNextCell(this.props.focusedCell, true));
    }

    if (cell.get('cell_type') === 'code') {
      this.context.dispatch(
        executeCell(this.props.channels, id, cell.get('source'))
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

  createCellElement(id) {
    const cellMap = this.props.notebook.get('cellMap');
    return (
      <div
        key={`cell-container-${id}`}
        ref="container"
      >
        <DraggableCell
          cell={cellMap.get(id)}
          language={this.getLanguageMode()}
          getCompletions={this.getCompletions}
          id={id}
          key={id}
          ref={id}
          displayOrder={this.props.displayOrder}
          transforms={this.props.transforms}
          moveCell={this.moveCell}
          pagers={this.props.cellPagers.get(id)}
          focusedCell={this.props.focusedCell}
          running={this.props.cellStatuses.get(id) === 'busy'}
          theme={this.props.theme}
        />
        <CellCreator key={`creator-${id}`} id={id} above={false} />
      </div>);
  }

  render() {
    if (!this.props.notebook) {
      return (
        <div className="notebook"></div>
      );
    }
    const cellOrder = this.props.notebook.get('cellOrder');
    return (
      <div className="notebook" ref="cells">
        <CellCreator id={cellOrder.get(0, null)} above />
      {
        cellOrder.map(this.createCellElement)
      }
      </div>
    );
  }
}

export default dragDropContext(HTML5Backend)(Notebook);
