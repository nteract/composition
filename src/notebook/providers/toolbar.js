/* eslint class-methods-use-this: 0 */
// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import ToolbarView from "../views/toolbar";

import {
  executeCell,
  removeCell,
  toggleStickyCell,
  clearOutputs,
  changeOutputVisibility,
  changeInputVisibility,
  changeCellType,
  toggleOutputExpansion
} from "../actions";

type Props = {
  cell: any,
  id: string,
  type: string,
  dispatch: Dispatch<Action>
};

class Toolbar extends Component {
  removeCell: () => void;
  executeCell: () => void;
  clearOutputs: () => void;
  toggleStickyCell: () => void;
  changeInputVisibility: () => void;
  changeOutputVisibility: () => void;
  changeCellType: () => void;
  toggleOutputExpansion: () => void;

  constructor(props: Props): void {
    super(props);
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
    const { dispatch } = this.props;
    dispatch(toggleStickyCell(this.props.id));
  }

  removeCell(): void {
    const { dispatch } = this.props;
    dispatch(removeCell(this.props.id));
  }

  executeCell(): void {
    const { dispatch } = this.props;
    dispatch(executeCell(this.props.id, this.props.cell.get("source")));
  }

  clearOutputs(): void {
    const { dispatch } = this.props;
    dispatch(clearOutputs(this.props.id));
  }

  changeInputVisibility(): void {
    const { dispatch } = this.props;
    dispatch(changeInputVisibility(this.props.id));
  }

  changeOutputVisibility(): void {
    const { dispatch } = this.props;
    dispatch(changeOutputVisibility(this.props.id));
  }

  changeCellType(): void {
    const { dispatch } = this.props;
    const to = this.props.type === "markdown" ? "code" : "markdown";
    dispatch(changeCellType(this.props.id, to));
  }

  toggleOutputExpansion(): void {
    const { dispatch } = this.props;
    dispatch(toggleOutputExpansion(this.props.id));
  }

  render(): ?React.Element<any> {
    const props = {
      ...this.props,
      executeCell: this.executeCell,
      removeCell: this.removeCell,
      toggleStickyCell: this.toggleStickyCell,
      clearOutputs: this.clearOutputs,
      changeInputVisibility: this.changeInputVisibility,
      changeOutputVisibility: this.changeOutputVisibility,
      toggleOutputExpansion: this.toggleOutputExpansion,
      changeCellType: this.changeCellType
    };

    return <ToolbarView {...props} />;
  }
}

export default connect()(Toolbar);
