import React from 'react';
import Immutable from 'immutable';
import Display from 'react-jupyter-display-area';
import { connect } from 'react-redux';

import PropTypes from '../../utils/PropTypes';
import Inputs from './inputs';
import Editor from './editor';


import {
  executeCell,
} from '../../actions';

const mapDispatchToProps = {
  executeCell
};

export class CodeCell extends React.Component {
  static displayName = 'CodeCell';

  static propTypes = {
    cell: PropTypes.any,
    displayOrder: PropTypes.list,
    id: PropTypes.string,
    language: PropTypes.string,
    theme: PropTypes.string,
    transforms: PropTypes.map
  };

  static contextTypes = {
    channels: React.PropTypes.object
  };

  keyDown(e) {
    if(e.key !== 'Enter') {
      return;
    }

    const shiftXORctrl = (e.shiftKey || e.ctrlKey) && !(e.shiftKey && e.ctrlKey);
    if (!shiftXORctrl) return;

    if (e.shiftKey) {
      // TODO: Remove this, as it should be created if at the end of document only
      // this.context.dispatch(createCellAfter('code', this.props.id));

      // should instead be
      // this.context.dispatch(nextCell(this.props.id));
    }

    this.props.executeCell(this.props.id, this.props.cell.get('source'));
  }

  render() {
    const {
      cell,
      id,
      language,
      displayOrder,
      transforms
    } = this.props;

    return (
      <div className='code_cell'>
        <div className='input_area' onKeyDown={this.keyDown.bind(this)}>
          <Inputs executionCount={cell.get('execution_count')}/>
          <Editor
            id={id}
            input={cell.get('source')}
            language={language}
          />
        </div>
        <Display className='cell_display'
         outputs={cell.get('outputs')}
         displayOrder={displayOrder}
         transforms={transforms}
        />
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(CodeCell);
