import React from 'react';
import { connect } from 'react-redux';

import { executeCell, removeCell } from '../../actions';

const mapDispatchToProps = {
  executeCell,
  removeCell
}

export class Toolbar extends React.Component {
  static displayName = 'Toolbar';

  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
    isSelected: React.PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
  }

  removeCell() {
    this.props.removeCell(this.props.id);
  }

  executeCell() {
    this.props.executeCell(this.props.id, this.props.cell.get('source'));
  }

  render() {
    return (
      <div className='cell_toolbar-mask'>
        <div className='cell_toolbar'>
          <button onClick={this.executeCell}>
            <i className='material-icons'>play_arrow</i>
          </button>
          <button onClick={this.removeCell}>
            <i className='material-icons'>delete</i>
          </button>
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Toolbar);
