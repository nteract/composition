/* @flow weak */
import React from 'react';
import ReactDOM from 'react-dom';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import CodeCell from './code-cell';
import MarkdownCell from './markdown-cell';
import Toolbar from './toolbar';

import {
  focusCell,
  focusPreviousCell,
  focusNextCell,
} from '../../actions';

type Props = {
  cell: any,
  displayOrder: ImmutableList<any>,
  id: string,
  focusedCell: string,
  language: string,
  running: boolean,
  theme: string,
  pagers: ImmutableList<any>,
  transforms: ImmutableMap<any>,
};

type State = {
  hoverCell: boolean,
}

export class Cell extends React.Component {
  props: Props;
  state: State;
  shouldComponentUpdate: (p: Props, s: State) => boolean;
  selectCell: () => void;
  focusAboveCell: () => void;
  focusBelowCell: () => void;
  setCellHoverState: (mouseEvent: Object) => void;

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(): void {
    super(...arguments);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.selectCell = this.selectCell.bind(this);
    this.focusAboveCell = this.focusAboveCell.bind(this);
    this.focusBelowCell = this.focusBelowCell.bind(this);
    this.setCellHoverState = this.setCellHoverState.bind(this);
  }

  state = {
    hoverCell: false,
  };

  componentDidMount(): void {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    document.addEventListener('mousemove', this.setCellHoverState, false);
  }

  componentWillUnmount(): void {
    document.removeEventListener('mousemove', this.setCellHoverState);
  }

  setCellHoverState(mouseEvent: Object): void {
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

  selectCell(): void {
    this.context.store.dispatch(focusCell(this.props.id));
  }

  focusAboveCell(): void {
    this.context.store.dispatch(focusPreviousCell(this.props.id));
  }

  focusBelowCell(): void {
    this.context.store.dispatch(focusNextCell(this.props.id, true));
  }

  render(): ?React.Element<any> {
    const cell = this.props.cell;
    const type = cell.get('cell_type');
    const focused = this.props.focusedCell === this.props.id;
    return (
      <div
        className={`cell ${type === 'markdown' ? 'text' : 'code'} ${focused ? 'focused' : ''}`}
        onClick={this.selectCell}
        ref="cell"
      >
        {
          focused ? <Toolbar
            type={type}
            cell={cell}
            id={this.props.id}
          /> : null
        }
        {
        type === 'markdown' ?
          <MarkdownCell
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focused={focused}
            cell={cell}
            id={this.props.id}
            theme={this.props.theme}
          /> :
          <CodeCell
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focused={focused}
            cell={cell}
            id={this.props.id}
            theme={this.props.theme}
            language={this.props.language}
            displayOrder={this.props.displayOrder}
            transforms={this.props.transforms}
            pagers={this.props.pagers}
            running={this.props.running}
          />
        }
      </div>
    );
  }
}

export default Cell;
