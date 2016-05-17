import React from 'react';

import {
  createCellAfter,
  createCellBefore,
  createCellAppend,
  mergeCellAfter } from '../../actions';

export default class CellCreatorButtons extends React.Component {
  static propTypes = {
    above: React.PropTypes.bool,
    id: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  constructor() {
    super();
    this.createCodeCell = this.createCell.bind(this, 'code');
    this.createTextCell = this.createCell.bind(this, 'markdown');
    this.createCell = this.createCell.bind(this);
    this.mergeCell = this.mergeCell.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  createCell(type) {
    if (!this.props.id) {
      this.context.dispatch(createCellAppend(type));
      return;
    }

    if (this.props.above) {
      this.context.dispatch(createCellBefore(type, this.props.id));
    } else {
      this.context.dispatch(createCellAfter(type, this.props.id));
    }
  }

  mergeCell() {
    this.context.dispatch(mergeCellAfter(this.props.id));
  }

  render() {
    const mergeButton = (
      <button onClick={this.mergeCell} title="merge cells">
        <span className="octicon octicon-arrow-up" />
      </button>);
    return (
      <div className="cell-creator">
        <button onClick={this.createTextCell} title="create text cell" className="add-text-cell">
          <span className="octicon octicon-markdown" />
        </button>
        <button onClick={this.createCodeCell} title="create code cell" className="add-code-cell">
          <span className="octicon octicon-code" />
        </button>
        {this.props.above ? null : mergeButton}
      </div>
    );
  }

}
