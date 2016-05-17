import React from 'react';

import { executeCell, removeCell } from '../../actions';

class Toolbar extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
    type: React.PropTypes.string,
  };

  static contextTypes = {
    channels: React.PropTypes.object,
    dispatch: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  removeCell() {
    this.context.dispatch(removeCell(this.props.id));
  }

  executeCell() {
    this.context.dispatch(executeCell(this.context.channels,
                                      this.props.id,
                                      this.props.cell.get('source')));
  }

  render() {
    const showPlay = this.props.type !== 'markdown';
    return (
      <div className="cell-toolbar-mask">
        <div className="cell-toolbar">
          {showPlay &&
            <button onClick={this.executeCell}>
              <span className="octicon octicon-triangle-right" />
            </button>}
          <button onClick={this.removeCell}>
            <span className="octicon octicon-trashcan" />
          </button>
        </div>
      </div>
    );
  }
}

export default Toolbar;
