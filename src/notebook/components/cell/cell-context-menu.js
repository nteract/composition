import React from 'react';
import { ContextMenu, MenuItem } from 'react-contextmenu';

import { clearCellOutput } from '../../actions';


class CellContextMenu extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
  };

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.clearCellOutput = this.clearCellOutput.bind(this);
  }

  clearCellOutput() {
    this.context.store.dispatch(clearCellOutput(this.props.id));
  }

  render() {
    return (
      <ContextMenu identifier="cell-context-menu">
        <MenuItem onClick={this.clearCellOutput}>Clear Cell Output</MenuItem>
      </ContextMenu>
    );
  }
}

export default CellContextMenu; 
