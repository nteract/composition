// @flow
import React, { Component } from "react";
import { connect } from "react-redux";

import {
  createCellAfter,
  createCellAppend,
  createCellBefore,
  mergeCellAfter
} from "../actions";
import CellCreatorView from "../views/cell-creator";

type Props = {|
  above: boolean,
  dispatch: Dispatch<*>,
  id: string | null
|};

class CellCreator extends Component {
  props: Props;
  createCell: (type: string) => void;
  mergeCell: () => void;

  constructor(): void {
    super();
    this.createCell = this.createCell.bind(this);
    this.mergeCell = this.mergeCell.bind(this);
  }

  createCell(type: string): void {
    const { dispatch, above, id } = this.props;

    if (!id) {
      dispatch(createCellAppend(type));
      return;
    }

    above
      ? dispatch(createCellBefore(type, id))
      : dispatch(createCellAfter(type, id));
  }

  mergeCell(): void {
    const { dispatch, id } = this.props;

    dispatch(mergeCellAfter(id));
  }

  render(): React.Element<any> {
    const props = {
      ...this.props,
      createCell: this.createCell,
      mergeCell: this.mergeCell
    };

    return <CellCreatorView {...props} />;
  }
}

export default connect()(CellCreator);
