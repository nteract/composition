import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { ContextMenuLayer } from 'react-contextmenu';

import Immutable from 'immutable';

import CodeCell from './code-cell';
import MarkdownCell from './markdown-cell';
import Toolbar from './toolbar';

import { focusCell, focusPreviousCell, focusNextCell } from '../../actions';

class Cell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.any,
    displayOrder: React.PropTypes.instanceOf(Immutable.List),
    id: React.PropTypes.string,
    getCompletions: React.PropTypes.func,
    focusedCell: React.PropTypes.string,
    language: React.PropTypes.string,
    onCellChange: React.PropTypes.func,
    running: React.PropTypes.bool,
    theme: React.PropTypes.string,
    pagers: React.PropTypes.instanceOf(Immutable.List),
    transforms: React.PropTypes.instanceOf(Immutable.Map),
  };

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor() {
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.selectCell = this.selectCell.bind(this);
    this.focusAboveCell = this.focusAboveCell.bind(this);
    this.focusBelowCell = this.focusBelowCell.bind(this);
    this.setCellHoverState = this.setCellHoverState.bind(this);
    this.setToolbarHoverState = this.setToolbarHoverState.bind(this);
  }

  state = {
    hoverCell: false,
    hoverToolbar: false,
  };

  componentWillMount() {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    document.addEventListener('mousemove', this.setCellHoverState, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.setCellHoverState);
  }

  setCellHoverState(mouseEvent) {
    if (this.refs.cell) {
      const cell = ReactDOM.findDOMNode(this.refs.cell);
      if (cell) {
        const x = mouseEvent.clientX;
        const y = mouseEvent.clientY;
        const regionRect = cell.getBoundingClientRect();
        const hoverCell = (regionRect.left < x && x < regionRect.right) &&
                     (regionRect.top < y && y < regionRect.bottom);
        this.setState({ hoverCell });
      }
    }
  }

  setToolbarHoverState(hoverToolbar) {
    this.setState({ hoverToolbar });
  }

  selectCell() {
    this.context.store.dispatch(focusCell(this.props.id));
  }

  focusAboveCell() {
    this.context.store.dispatch(focusPreviousCell(this.props.id));
  }

  focusBelowCell() {
    this.context.store.dispatch(focusNextCell(this.props.id));
  }

  render() {
    const cell = this.props.cell;
    const type = cell.get('cell_type');
    const focused = this.props.focusedCell === this.props.id;
    return (
      <div
        className={`cell ${type === 'markdown' ? 'text' : 'code'} ${focused ? 'focused' : ''}`}
        onClick={this.selectCell}
        ref="cell"
        onContextMenu={this.contextMenu}
      >
        {
          this.state.hoverCell || this.state.hoverToolbar ? <Toolbar
            type={type}
            setHoverState={this.setToolbarHoverState}
            cell={this.props.cell}
            id={this.props.id}
          /> : null
        }
        {
        type === 'markdown' ?
          <MarkdownCell
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focused={this.props.id === this.props.focusedCell}
            cell={this.props.cell}
            id={this.props.id}
            theme={this.props.theme}
          /> :
          <CodeCell
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focused={this.props.id === this.props.focusedCell}
            cell={this.props.cell}
            id={this.props.id}
            theme={this.props.theme}
            language={this.props.language}
            displayOrder={this.props.displayOrder}
            transforms={this.props.transforms}
            pagers={this.props.pagers}
            running={this.props.running}
            getCompletions={this.props.getCompletions}
          />
        }
      </div>
    );
  }
}

export default ContextMenuLayer("cell-context-menu")(Cell);
