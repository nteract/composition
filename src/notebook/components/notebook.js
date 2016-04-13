import React from 'react';
import ReactDOM from 'react-dom';
import { DragDropContext as dragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import DraggableCell from './cell/draggable-cell';
import CellCreator from './cell/cell-creator';
import { executeCell, focusNextCell, moveCell } from '../actions';
import { HTMLScriptlessDisplay } from './html-scriptless';
import { JavascriptFrame } from './javascript-frame';

import Immutable from 'immutable';

import { displayOrder, transforms } from 'transformime-react';

class Notebook extends React.Component {
  static propTypes = {
    channels: React.PropTypes.any,
    displayOrder: React.PropTypes.instanceOf(Immutable.List),
    notebook: React.PropTypes.any,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
    cellPagers: React.PropTypes.instanceOf(Immutable.Map),
    focusedCell: React.PropTypes.string,
  };

  static defaultProps = {
    displayOrder: displayOrder
      .remove('application/javascript'),
    transforms: transforms
      .remove('application/javascript')
      .set('text/html', HTMLScriptlessDisplay),
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  static childContextTypes = {
    channels: React.PropTypes.object,
  };

  constructor() {
    super();
    this.createCellElement = this.createCellElement.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.moveCell = this.moveCell.bind(this);
  }

  getChildContext() {
    return {
      channels: this.props.channels,
    };
  }

  componentWillMount() {
    require('codemirror/mode/markdown/markdown');

    const lang = this.props.notebook.getIn(['metadata', 'kernelspec', 'language']);
    if (!lang) {
      return;
    }
    // HACK: This should give you the heeby-jeebies
    // Mostly because lang could be ../../../../whatever
    // This is the notebook though, so hands off
    // We'll want to check for this existing later
    // and any other validation
    require(`codemirror/mode/${lang}/${lang}`);
    // Assume markdown should be required
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
      this.context.dispatch(focusNextCell(this.props.focusedCell));
    }

    if (cell.get('cell_type') === 'code') {
      this.context.dispatch(
        executeCell(this.props.channels, id, cell.get('source'))
      );
    }
  }

  moveCell(sourceId, destinationId, above) {
    this.context.dispatch(moveCell(sourceId, destinationId, above));
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
          language={this.props.notebook.getIn(['metadata', 'language_info', 'name'])}
          id={id}
          key={id}
          ref={id}
          displayOrder={this.props.displayOrder}
          transforms={this.props.transforms}
          moveCell={this.moveCell}
          pagers={this.props.cellPagers.get(id)}
          focusedCell={this.props.focusedCell}
        />
        <CellCreator key={`creator-${id}`} id={id} above={false} />
      </div>);
  }

  render() {
    if (!this.props.notebook) {
      return (
        <div></div>
      );
    }
    const cellOrder = this.props.notebook.get('cellOrder');
    return (
      <div style={{
        paddingTop: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
      }} ref="cells"
      >
        <JavascriptFrame
          notebook={this.props.notebook}
          displayOrder={this.props.displayOrder}
        />
        <CellCreator id={cellOrder.get(0, null)} above />
      {
        cellOrder.map(this.createCellElement)
      }
      </div>
    );
  }
}

export default dragDropContext(HTML5Backend)(Notebook);
