import { actions, AppState, ContentRef, selectors } from "@nteract/core";
import { createConfigOption, theme } from "@nteract/mythic-configuration";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

const {
  selector: editorType,
} = createConfigOption("editorType")("codemirror");

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
  theme: string;
}

interface DispatchProps {
  onChange: (text: string) => void;
  onFocusChange: (focused: boolean) => void;
}

type Props = ComponentProps & StateProps & DispatchProps;

export class Editor extends React.PureComponent<Props> {
  render(): JSX.Element | null {
    const { editorType } = this.props;

    let chosenOne: React.ReactChild | null = null;

    React.Children.forEach(this.props.children, child => {
      if (!child) {
        return;
      }

      if (typeof child === "string" || typeof child === "number") {
        return;
      }

      const childElement = child;
      if (chosenOne) {
        // Already have a selection
        return;
      }

      if (
        !childElement ||
        typeof childElement !== "object" ||
        !("props" in childElement)
      ) {
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
      editorType: this.props.editorType,
      value: this.props.value,
      editorFocused: this.props.editorFocused,
      channels: this.props.channels,
      kernelStatus: this.props.kernelStatus,
      theme: this.props.theme,
      onChange: this.props.onChange,
      onFocusChange: this.props.onFocusChange,
      className: "nteract-cell-editor"
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

    if (model && model.type === "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        editorFocused = model.editorFocused === id;
        value = cell.get("source", "");
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
      editorType: editorType(state),
      theme: theme(state),
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
