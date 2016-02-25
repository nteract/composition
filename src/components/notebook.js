import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import DraggableCell from './cell';
import { moveCell } from '../actions';

class Notebook extends React.Component {
  static displayName = 'Notebook';

  static propTypes = {
    channels: React.PropTypes.any,
    focused: React.PropTypes.string,
    notebook: React.PropTypes.any,
    onCellChange: React.PropTypes.func,
    selected: React.PropTypes.array,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  static childContextTypes = {
    channels: React.PropTypes.object,
  };

  getChildContext() {
    return {
      channels: this.props.channels,
    };
  }

  componentWillMount() {
    require('codemirror/mode/markdown/markdown');

    const lang = this.props.notebook.getIn(['metadata', 'language_info', 'name']);
    if (!lang) {
      return;
    }
    // HACK: This should give you the heeby-jeebies
    // Mostly because lang could be ../../../../whatever
    // This is the notebook though, so hands off
    // We'll want to check for this existing later
    // and any other validation
    require('codemirror/mode/' + lang + '/' + lang);
    // Assume markdown should be required
  }

  render() {
    if(!this.props.notebook) {
      return (
        <div></div>
      );
    }
    const cellMap = this.props.notebook.get('cellMap');
    const cellOrder = this.props.notebook.get('cellOrder');
    return (
      <div style={{
        paddingTop: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
      }} ref='cells'>

      {
        cellOrder.map(id => {
          const selected = this.props.selected && this.props.selected.indexOf(id) !== -1;
          return <DraggableCell cell={cellMap.get(id)}
                       language={this.props.notebook.getIn(['metadata', 'language_info', 'name'])}
                       id={id}
                       key={id}
                       isSelected={selected}
                       isFocused={this.props.focused === id}
                       onTextChange={text => {
                         const newCell = cellMap.get(id).set('source', text);
                         this.props.onCellChange(id, newCell);
                       }
                       }
                       moveCell={(sourceId, destinationId, above) => {
                         return this.context.dispatch(moveCell(sourceId, destinationId, above));
                       }}
                       />;
        })
      }
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Notebook);
