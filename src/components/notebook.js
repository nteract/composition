import React from 'react';
import PropTypes from '../utils/PropTypes';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';

import DraggableCell from './cell';
import {
  moveCell,
  updateCellSource
} from '../actions';

import Immutable from 'immutable';

const mapStateToProps = (state) => ({
  selected: state.getIn(['notebook', 'selected']),
  notebook: state.getIn(['notebook', 'current']),
  channels: state.getIn(['kernel', 'channels'])
});

const mapDispatchToProps = {
  moveCell,
  updateCellSource
};

export class Notebook extends React.Component {
  static displayName = 'Notebook';

  static propTypes = {
    channels: PropTypes.any,
    notebook: PropTypes.any,
    selected: PropTypes.list,
  };

  static childContextTypes = {
    channels: PropTypes.object,
  };

  getChildContext() {
    return {
      channels: this.props.channels,
    };
  }

  componentWillMount() {
    require('codemirror/mode/markdown/markdown');

    const lang = this.props.notebook.getIn(['metadata', 'language_info', 'name']);

    if (!lang) return;

    // HACK: This should give you the heeby-jeebies
    // Mostly because lang could be ../../../../whatever
    // This is the notebook though, so hands off
    // We'll want to check for this existing later
    // and any other validation
    require('codemirror/mode/' + lang + '/' + lang);
    // Assume markdown should be required
  }

  render() {
    const {
      notebook,
      selected,
      moveCell
    } = this.props;

    if (!notebook) {
      return (
        <div></div>
      );
    }

    const cellMap = notebook.get('cellMap');
    const cellOrder = notebook.get('cellOrder');
    return (
      <div style={{
        paddingTop: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
      }} ref='cells'>
        {cellOrder.map(id => {
          const cellIsSelected = selected && selected.includes(id);
          return (
            <DraggableCell cell={cellMap.get(id)}
              language={this.props.notebook.getIn(['metadata', 'language_info', 'name'])}
              id={id}
              key={id}
              isSelected={cellIsSelected}
              onTextChange={text => updateCellSource(id, text)}
              moveCell={moveCell}
            />
          );
        })
        }
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  DragDropContext(HTML5Backend)(Notebook)
);
