import React from 'react';
import { DragDropContext as dragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import DraggableCell from './cell/draggable-cell';
import CellCreator from './cell/cell-creator';
import { moveCell, setSelected } from '../actions';

import Immutable from 'immutable';

class Notebook extends React.Component {
  static propTypes = {
    channels: React.PropTypes.any,
    displayOrder: React.PropTypes.instanceOf(Immutable.List),
    notebook: React.PropTypes.any,
    onCellChange: React.PropTypes.func,
    selected: React.PropTypes.string,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
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
    const cellOrder = this.props.notebook.get('cellOrder');
    const firstCell = cellOrder.get(0);
    if (firstCell) {
      this.context.dispatch(setSelected(firstCell));
      location.hash = firstCell;
    }
  }

  componentWillReceiveProps(nextProps) {
    location.hash = "";
    location.hash = nextProps.selected;
  }

  setSelected(id) {
    this.context.dispatch(setSelected(id));
  }

  moveCell(sourceId, destinationId, above) {
    this.context.dispatch(moveCell(sourceId, destinationId, above));
  }

  createCellElement(id) {
    const cellMap = this.props.notebook.get('cellMap');

    return (
      <div
        key={`cell-container-${id}`}
        id={id}
        onClick={this.setSelected.bind(this, id)}
        className={this.props.selected === id ? 'selected' : ''}
      >
        <DraggableCell cell={cellMap.get(id)}
          language={this.props.notebook.getIn(['metadata', 'language_info', 'name'])}
          id={id}
          key={id}
          displayOrder={this.props.displayOrder}
          transforms={this.props.transforms}
          moveCell={this.moveCell}
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
        <CellCreator id={cellOrder.get(0, null)} above />
      {
        cellOrder.map(this.createCellElement)
      }
      </div>
    );
  }
}

export default dragDropContext(HTML5Backend)(Notebook);
