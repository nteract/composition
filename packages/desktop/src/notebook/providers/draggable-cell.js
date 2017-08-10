// @flow
import React from "react";

import { connect } from "react-redux";
import { focusCell } from "../actions";

import DraggableCellView from "../views/draggable-cell";

type Props = {|
  dispatch: Dispatch<*>,
  id: string
|};

class DraggableCell extends React.Component {
  props: Props;
  selectCell: () => void;

  constructor(): void {
    super();
    this.selectCell = this.selectCell.bind(this);
  }

  selectCell(): void {
    const { dispatch, id } = this.props;
    dispatch(focusCell(id));
  }

  render(): ?React.Element<any> {
    const props = {
      ...this.props,
      selectCell: this.selectCell
    };
    return <DraggableCellView {...props} />;
  }
}

export default connect()(DraggableCell);
