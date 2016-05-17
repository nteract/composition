import React from 'react';

import CodeCell from './code-cell';
import MarkdownCell from './markdown-cell';
import Toolbar from './toolbar';

import { focusCell, focusPreviousCell, focusNextCell } from '../../actions';

class Cell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
    focusedCell: React.PropTypes.string,
    onCellChange: React.PropTypes.func,
    running: React.PropTypes.bool,
    theme: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  constructor() {
    super();
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.selectCell = this.selectCell.bind(this);
    this.focusAboveCell = this.focusAboveCell.bind(this);
    this.focusBelowCell = this.focusBelowCell.bind(this);
  }

  state = {
    showToolbar: false,
  };

  onMouseEnter() {
    this.setState({ showToolbar: true });
  }

  onMouseLeave() {
    this.setState({ showToolbar: false });
  }

  selectCell() {
    this.context.dispatch(focusCell(this.props.id));
  }

  focusAboveCell() {
    this.context.dispatch(focusPreviousCell(this.props.id));
  }

  focusBelowCell() {
    this.context.dispatch(focusNextCell(this.props.id));
  }

  render() {
    const cell = this.props.cell;
    const type = cell.get('cell_type');
    const focused = this.props.focusedCell === this.props.id;
    return (
      <div
        className={`cell ${type === 'markdown' ? 'text' : 'code'} ${focused ? 'focused' : ''}`}
        onClick={this.selectCell}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {
          this.state.showToolbar ? <Toolbar type={type} { ...this.props } /> : null
        }
        {
        type === 'markdown' ?
          <MarkdownCell
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focused={this.props.id === this.props.focusedCell}
            {...this.props}
          /> :
          <CodeCell
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focused={this.props.id === this.props.focusedCell}
            {...this.props}
          />
        }
      </div>
    );
  }
}

export default Cell;
