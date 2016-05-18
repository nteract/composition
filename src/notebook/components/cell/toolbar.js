import React from 'react';
import ReactDOM from 'react-dom';

import { executeCell, removeCell, clearCell } from '../../actions';

class Toolbar extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
    type: React.PropTypes.string,
    setHoverState: React.PropTypes.func,
  };

  static contextTypes = {
    channels: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    notificationSystem: React.PropTypes.any,
    kernelConnected: React.PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
    this.clearCell = this.clearCell.bind(this);
    this.setHoverState = this.setHoverState.bind(this);
  }

  componentWillMount() {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    document.addEventListener('mousemove', this.setHoverState, false);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.setHoverState);
  }

  setHoverState(mouseEvent) {
    if (this.refs.mask) {
      const mask = ReactDOM.findDOMNode(this.refs.mask);
      if (mask) {
        const x = mouseEvent.clientX;
        const y = mouseEvent.clientY;
        const regionRect = mask.getBoundingClientRect();
        const hover = (regionRect.left < x && x < regionRect.right) &&
                     (regionRect.top < y && y < regionRect.bottom);
        this.props.setHoverState(hover);
      }
    }
  }

  removeCell() {
    this.context.dispatch(removeCell(this.props.id));
  }

  executeCell() {
    this.context.dispatch(executeCell(this.context.channels,
                                      this.props.id,
                                      this.props.cell.get('source'),
                                      this.context.kernelConnected,
                                      this.context.notificationSystem));
  }

  clearCell() {
    this.context.dispatch(clearCell(this.context.channels,
                                    this.props.id));
  }

  render() {
    const showPlay = this.props.type !== 'markdown';
    return (
      <div className="cell-toolbar-mask" ref="mask">
        <div className="cell-toolbar">
          {showPlay &&
            <span>
              <button onClick={this.executeCell}>
                <span className="octicon octicon-triangle-right" />
              </button>
              <button onClick={this.clearCell}>
                <span className="octicon octicon-x" />
              </button>
            </span>}
          <button onClick={this.removeCell}>
            <span className="octicon octicon-trashcan" />
          </button>
        </div>
      </div>
    );
  }
}

export default Toolbar;
