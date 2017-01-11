/* eslint class-methods-use-this: 0 */
// @flow
import React, { Component } from 'react';
import ToolbarView from '../views/toolbar';
import Dropdown from 'react-simple-dropdown';
import { connect } from 'react-redux';

import {
  executeCell,
  removeCell,
  toggleStickyCell,
  clearOutputs,
  changeOutputVisibility,
  changeInputVisibility,
  changeCellType,
  toggleOutputExpansion,
} from '../actions';

type Props = {
  cell: any,
  id: string,
  type: string,
  dropdown: Dropdown,
  dispatch: Dispatch,
};

class Toolbar extends Component {
  props: Props;

  constructor(): void {
    super();
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
    this.clearOutputs = this.clearOutputs.bind(this);
    this.toggleStickyCell = this.toggleStickyCell.bind(this);
    this.changeInputVisibility = this.changeInputVisibility.bind(this);
    this.changeOutputVisibility = this.changeOutputVisibility.bind(this);
    this.changeCellType = this.changeCellType.bind(this);
    this.toggleOutputExpansion = this.toggleOutputExpansion.bind(this);
  }

  toggleStickyCell(): void {
    const { dispatch, id } = this.props;
    dispatch(toggleStickyCell(id));
  }

  removeCell(): void {
    const { dispatch, id } = this.props;
    dispatch(removeCell(id));
  }

  executeCell(): void {
    const { dispatch, id, cell} = this.props;
    dispatch(executeCell(id,
                        cell.get('source')));
  }

  clearOutputs(): void {
    this.dropdown.hide();
    const { dispatch, id } = this.props;
    dispatch(clearOutputs(id));
  }

  changeInputVisibility(): void {
    this.dropdown.hide();
    const { dispatch, id } = this.props;
    dispatch(changeInputVisibility(id));
  }

  changeOutputVisibility(): void {
    this.dropdown.hide();
    const { dispatch, id } = this.props;
    dispatch(changeOutputVisibility(id));
  }

  changeCellType(): void {
    this.dropdown.hide();
    const { dispatch, id, type } = this.props;
    const to = type === 'markdown' ? 'code' : 'markdown';
    dispatch(changeCellType(id, to));
  }

  toggleOutputExpansion(): void {
    const { dispatch, id } = this.props;
    dispatch(toggleOutputExpansion(id));
  }

  render(): ?React.Element<any> {
    const props: ToolbarProps = {
      ...this.props,
      executeCell: this.executeCell,
      removeCell: this.removeCell,
      toggleStickyCell: this.toggleStickyCell,
      clearOutputs: this.clearOutputs,
      changeInputVisibility: this.changeInputVisibility,
      changeOutputVisibility: this.changeOutputVisibility,
      toggleOutputExpansion: this.toggleOutputExpansion,
      changeCellType: this.changeCellType,
    };

    return (
      <ToolbarView {...props}/>
    );
  }
}

export default connect()(Toolbar);
