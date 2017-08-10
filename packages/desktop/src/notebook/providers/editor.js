// @flow
import React, { Component } from "react";
import { connect } from "react-redux";

import { focusCell, focusCellEditor, updateCellSource } from "../actions";
import EditorView from "@nteract/editor";

type Props = {
  dispatch: Dispatch<*>,
  id: string,
  input: any,
  editorFocused: boolean,
  cellFocused: boolean,
  completion: boolean,
  tip: boolean,
  focusAbove: () => void,
  focusBelow: () => void,
  theme: string,
  channels: any,
  cursorBlinkRate: number,
  executionState: "idle" | "starting" | "not connected",
  language: string
};

function mapStateToProps(state: Object): Object {
  return {
    cursorBlinkRate: state.config.get("cursorBlinkRate"),
    channels: state.app.channels,
    executionState: state.app.executionState
  };
}

class Editor extends Component {
  props: Props;
  onChange: (text: string) => void;
  onFocusChange: (focused: boolean) => void;

  constructor(): void {
    super();

    this.onChange = this.onChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onChange(text: string): void {
    const { dispatch, id } = this.props;

    dispatch(updateCellSource(id, text));
  }

  onFocusChange(focused: boolean): void {
    const { cellFocused, dispatch, id } = this.props;

    if (focused) {
      dispatch(focusCellEditor(id));
      if (!cellFocused) {
        dispatch(focusCell(id));
      }
    }
  }

  render(): React.Element<*> {
    const props = {
      ...this.props,
      onChange: this.onChange,
      onFocusChange: this.onFocusChange
    };

    return <EditorView {...props} />;
  }
}

export default connect(mapStateToProps)(Editor);
