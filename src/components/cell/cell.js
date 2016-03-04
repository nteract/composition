import React from 'react';
import { connect } from 'react-redux';

import PropTypes from '../../utils/PropTypes';

import CodeCell from './code-cell';
import MarkdownCell from './markdown-cell';
import Toolbar from './toolbar';

import { setSelected } from '../../actions';

const mapDispatchToProps = {
  setSelected
};

export class Cell extends React.Component {
  static displayName = 'Cell';

  static propTypes = {
    cell: PropTypes.any,
    id: PropTypes.string,
    isSelected: PropTypes.bool,
  };

  setSelected(e) {
    const additive = e.shiftKey;
    this.props.setSelected([this.props.id], additive);
  }

  render() {
    const { cell } = this.props;

    const type = cell.get('cell_type');

    const selected = this.props.isSelected ? 'selected' : '';

    return (
      <div
        onClick={this.setSelected.bind(this)}
        className={'cell ' + selected}>
        {this.props.isSelected && <Toolbar {...this.props}/>}
        {
          type === 'markdown'
            ? <MarkdownCell {...this.props}/>
            : <CodeCell {...this.props}/>
        }
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Cell);
