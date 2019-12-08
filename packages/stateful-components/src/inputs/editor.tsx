import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { AppState, ContentRef, actions, selectors } from "@nteract/core";

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  children: React.ReactNode;
}

interface StateProps {
  editorType: string;
  editorFocused: boolean;
  value: string;
  channels: any;
  kernelStatus: string;
}

export class Editor extends React.Component<ComponentProps & StateProps> {
  render() {
    const { editorType } = this.props;

    let chosenOne: React.ReactChild | null = null;

    // Find the first child element that matches something in this.props.data
    React.Children.forEach(this.props.children, child => {
      if (typeof child === "string" || typeof child === "number") {
        return;
      }

      const childElement = child;
      if (chosenOne) {
        // Already have a selection
        return;
      }
      if (childElement.props && childElement.props.editorType) {
        const child_editor_type = childElement.props.editorType;

        chosenOne = child_editor_type === editorType ? childElement : null;
        return;
      }
    });

    // If we didn't find a match, render nothing
    if (chosenOne === null) {
      return null;
    }

    // Render the output component that handles this output type
    return React.cloneElement(chosenOne, {
      editorFocused: this.props.editorFocused,
      value: this.props.value,
      channels: this.props.channels,
      kernelStatus: this.props.kernelStatus,
      editorType: this.props.editorType,
      className: "nteract-editor"
    });
  }
}

export const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
) => {
  const { id, contentRef } = ownProps;
  const mapStateToProps = (state: AppState): StateProps => {
    const model = selectors.model(state, { contentRef });

    let editorFocused = false;
    let channels = null;
    let kernelStatus = "not connected";
    let value = "";
    let editorType = "codemirror";

    if (model && model.type === "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        editorFocused = model.editorFocused === id;
        value = cell.get("source", "");
        console.log(cell);
        if (cell.cell_type === "code") {
          const kernel = selectors.kernelByContentRef(state, { contentRef });
          if (kernel) {
            channels = kernel.channels;
            kernelStatus = kernel.status || "not connected";
          }
        }
      }
    }

    return {
      editorFocused,
      value,
      channels,
      kernelStatus,
      editorType
    };
  };

  return mapStateToProps;
};

export const makeMapDispatchToProps = (
  initialDispatch: Dispatch,
  ownProps: ComponentProps
) => {
  const { id, contentRef } = ownProps;
  const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
      onChange: (text: string) => {
        dispatch(actions.updateCellSource({ id, value: text, contentRef }));
      },

      onFocusChange(focused: boolean): void {
        if (focused) {
          dispatch(actions.focusCellEditor({ id, contentRef }));
          // Assume we can focus the cell if now focusing the editor
          // If this doesn't work, we need to go back to checking !cellFocused
          dispatch(actions.focusCell({ id, contentRef }));
        }
      }
    };
  };
  return mapDispatchToProps;
};

export default connect(makeMapStateToProps, makeMapDispatchToProps)(Editor);
