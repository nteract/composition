import React from 'react';
import ReactDOM from 'react-dom';

import CodeCell from './code-cell';
import MarkdownCell from './markdown-cell';

import { setSelected } from '../../actions';

class Cell extends React.Component {
  static displayName = 'Cell';

  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
    isFocused: React.PropTypes.bool,
    isSelected: React.PropTypes.bool,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.setSelected = this.setSelected.bind(this);
  }

  componentWillUpdate() {
    const node = ReactDOM.findDOMNode(this);
    this.scrollHeight = node.scrollHeight;
    this.scrollTop = node.scrollTop;
  }

  componentDidUpdate() {
    const node = ReactDOM.findDOMNode(this);
    node.scrollTop = this.scrollTop + (node.scrollHeight - this.scrollHeight);
    if(this.props.isFocused) {
      node.scrollIntoView();
    }
  }

  setSelected(e) {
    const additive = e.shiftKey;
    this.context.dispatch(setSelected([this.props.id], additive));
  }

  render() {
    const cell = this.props.cell;
    const type = cell.get('cell_type');
    const selected = this.props.isSelected ? 'selected' : '';
    return (
      <div
        onClick={this.setSelected}
        className={'cell ' + selected}>
        {
        type === 'markdown' ?
          <MarkdownCell {...this.props}/> :
          <CodeCell {...this.props}/>
        }
      </div>
    );
  }
}

export default Cell;
