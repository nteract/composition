/* eslint class-methods-use-this: 0 */
// @flow
import React from 'react';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';
import { connect } from 'react-redux';

import {
  createCellAfter,
  createCellBefore,
  createCellAppend,
  mergeCellAfter,
} from '../../actions';

type Props = {
  above: boolean,
  id: string,
};

export class CellCreatorButtons extends React.Component {
  props: Props;
  shouldComponentUpdate: (p: Props, s: any) => boolean;
  createCodeCell: (type: string) => void;
  createTextCell: (type: string) => void;
  createCell: (type: string) => void;
  mergeCell: () => void;

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(): void {
    super(...arguments);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.createCodeCell = this.createCell.bind(this, 'code');
    this.createTextCell = this.createCell.bind(this, 'markdown');
    this.createCell = this.createCell.bind(this);
    this.mergeCell = this.mergeCell.bind(this);
  }

  shouldComponentUpdate(p: Props, s: any): boolean {
    return false;
  }

  createCell(type: string): void {
    if (!this.props.id) {
      this.context.store.dispatch(createCellAppend(type));
      return;
    }

    if (this.props.above) {
      this.context.store.dispatch(createCellBefore(type, this.props.id));
    } else {
      this.context.store.dispatch(createCellAfter(type, this.props.id));
    }
  }

  mergeCell(): void {
    this.context.store.dispatch(mergeCellAfter(this.props.id));
  }

  render(): ?React.Element<any> {
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

export default connect()(CellCreatorButtons);
