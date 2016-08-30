import React from 'react';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import { executeCell } from '../../epics/execute';

import {
  removeCell,
  toggleStickyCell,
  clearCellOutput,
  changeOutputVisibility,
} from '../../actions';

const mapStateToProps = (state) => ({
  channels: state.app.channels,
});

export class DumbToolbar extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    channels: React.PropTypes.object,
    id: React.PropTypes.string,
    type: React.PropTypes.string,
  };

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
    this.clearCellOutput = this.clearCellOutput.bind(this);
    this.toggleStickyCell = this.toggleStickyCell.bind(this);
    this.changeOutputVisibility = this.changeOutputVisibility.bind(this);
    this.callContextMenu = this.callContextMenu.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  toggleStickyCell() {
    this.context.store.dispatch(toggleStickyCell(this.props.id));
  }

  removeCell() {
    this.context.store.dispatch(removeCell(this.props.id));
  }

  executeCell() {
    this.context.store.dispatch(executeCell(
                                      this.props.id,
                                      this.props.cell.get('source')));
  }

  clearCellOutput() {
    this.context.store.dispatch(clearCellOutput(this.props.id));
  }

  changeOutputVisibility() {
    this.context.store.dispatch(changeOutputVisibility(this.props.id));
  }
  // Simulate control click to get react context menu to drop down
  callContextMenu() {
    console.log('Pressing button!');
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(
      'click' /* type */, true /* canBubble */, true /* cancelable */,
      window /* view */, 0 /* detail */, 0 /* screenX */,
      0/* screenY */, 80 /* clientX */, 20 /* clientY */, true /* ctrlkey */,
      false /* altkey */, false /* shift */, false /* metakey */, 0 /* button*/,
      null /* target */);
    console.log(evt);
    document.body.dispatchEvent(evt);
  }

  render() {
    const showPlay = this.props.type !== 'markdown';
    return (
      <div className="cell-toolbar-mask" ref="mask">
        <div className="cell-toolbar">
          {showPlay &&
            <span>
              <button onClick={this.executeCell} className="executeButton" >
                <span className="octicon octicon-triangle-right" />
              </button>
            </span>}
          <button onClick={this.removeCell}>
            <span className="octicon octicon-trashcan" />
          </button>
          <button onClick={this.toggleStickyCell}>
            <span className="octicon octicon-pin" />
          </button>
          <button onClick={this.callContextMenu}>
            <span className="octicon octicon-chevron-down" />
          </button>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DumbToolbar);
