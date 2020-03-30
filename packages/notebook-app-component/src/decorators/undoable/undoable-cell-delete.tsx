import { actions, AppState, selectors } from "@nteract/core";
import { createConfigOption } from "@nteract/mythic-configuration";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import styled from "styled-components";
import UndoableDelete from "./undoable-delete";

export const {
  selector: deleteDelay,
} = createConfigOption({
  key: "deleteDelay",
  label: "Delay for undo-ing deletes",
}, 10_000);

interface InitialProps extends selectors.cell.CellAddress {
  children: React.ReactNode;
}

interface InnerProps extends InitialProps {
  className?: string;
  secondsDelay: number;
  isDeleting: boolean;
  doDelete: () => void;
  doUndo: () => void;
}

const BareUndoableCellDelete = (props: InnerProps) => (
  <div className={props.className}>
    <UndoableDelete
      secondsDelay={props.secondsDelay}
      message="This cell has been deleted."
      isDeleting={props.isDeleting}
      doDelete={props.doDelete}
      doUndo={props.doUndo}
    >
      {props.children}
    </UndoableDelete>
  </div>
);
BareUndoableCellDelete.displayName = "BareUndoableCellDelete";

const UnstyledUndoableCellDelete = connect(
  (state: AppState, props: InitialProps) => ({
    isDeleting: !!selectors.cell
      .cellFromState(state, selectors.cell.cellAddress(props))
      .getIn(["metadata", "nteract", "transient", "deleting"]),
    secondsDelay: deleteDelay(state) / 1000
  }),
  (dispatch: Dispatch, props: InitialProps) => ({
    doDelete: () =>
      dispatch(actions.deleteCell(selectors.cell.cellAddress(props))),
    doUndo: () =>
      dispatch(actions.unmarkCellAsDeleting(selectors.cell.cellAddress(props)))
  })
)(BareUndoableCellDelete);
UnstyledUndoableCellDelete.displayName = "UnstyledUndoableCellDelete";

const UndoableCellDelete = styled(UnstyledUndoableCellDelete)`
  & > .undo-deletion {
    background-color: var(--theme-cell-input-bg);
    color: var(--theme-cell-input-fg);
    padding: 1rem 10rem 1rem 1rem;

    & > button {
      position: absolute;
      right: 1.25rem;
      z-index: 1;
    }
  }
`;
UndoableCellDelete.displayName = "UndoableCellDelete";

export default UndoableCellDelete;
export {
  BareUndoableCellDelete,
  UndoableCellDelete,
  UnstyledUndoableCellDelete
};
