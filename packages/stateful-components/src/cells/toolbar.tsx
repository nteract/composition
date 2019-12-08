import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { ContentRef, actions } from "@nteract/core";
import { CellType } from "@nteract/commutable";

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  children: React.ReactNode;
}

interface DispatchProps {
  executeCell: () => void;
  deleteCell: () => void;
  clearOutputs: () => void;
  toggleParameterCell: () => void;
  toggleCellInputVisibility: () => void;
  toggleCellOutputVisibility: () => void;
  toggleOutputExpansion: () => void;
  changeToMarkdownCell: () => void;
  changeToCodeCell: () => void;
  changeCellType: (to: CellType) => void;
  selectCell: () => void;
  focusEditor: () => void;
  focusAboveCell: () => void;
  focusBelowCell: () => void;
  unfocusEditor: () => void;
}

export class CellToolbar extends React.Component {
  render() {
    return React.cloneElement(this.props.children, this.props);
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ComponentProps
): DispatchProps => {
  const { id, contentRef } = ownProps;
  return {
    executeCell: () => dispatch(actions.executeCell({ id, contentRef })),
    deleteCell: () => dispatch(actions.deleteCell({ id, contentRef })),
    clearOutputs: () => dispatch(actions.clearOutputs({ id, contentRef })),
    toggleParameterCell: () =>
      dispatch(actions.toggleParameterCell({ id, contentRef })),
    toggleCellInputVisibility: () =>
      dispatch(actions.toggleCellInputVisibility({ id, contentRef })),
    toggleCellOutputVisibility: () =>
      dispatch(actions.toggleCellOutputVisibility({ id, contentRef })),
    toggleOutputExpansion: () =>
      dispatch(actions.toggleOutputExpansion({ id, contentRef })),
    changeToMarkdownCell: () =>
      dispatch(actions.changeCellType({ id, contentRef, to: "markdown" })),
    changeToCodeCell: () =>
      dispatch(actions.changeCellType({ id, contentRef, to: "code" })),
    changeCellType: (to: CellType) =>
      dispatch(actions.changeCellType({ id, contentRef, to })),
    selectCell: () => dispatch(actions.focusCell({ id, contentRef })),
    focusEditor: () => dispatch(actions.focusCellEditor({ id, contentRef })),
    focusAboveCell: () => {
      dispatch(actions.focusPreviousCell({ id, contentRef }));
      dispatch(actions.focusPreviousCellEditor({ id, contentRef }));
    },
    focusBelowCell: () => {
      dispatch(
        actions.focusNextCell({ id, createCellIfUndefined: true, contentRef })
      );
      dispatch(actions.focusNextCellEditor({ id, contentRef }));
    },
    unfocusEditor: () =>
      dispatch(actions.focusCellEditor({ id: undefined, contentRef }))
  };
};

export default connect(null, mapDispatchToProps)(CellToolbar);
