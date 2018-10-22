// @flow
import { connect } from "react-redux";
import { actions, selectors } from "@nteract/core";
import type { ContentRef, AppState } from "@nteract/core";
import { omit } from "lodash";
import EditorView from "@nteract/editor";

type Props = {
  id: string,
  cellFocused: boolean,
  contentRef: ContentRef,
  options: Object
};

function mapStateToProps(state: AppState, ownProps: Props) {
  const kernel = selectors.currentKernel(state);
  const cursorBlinkRate = state.config.get("cursorBlinkRate", 530);
  return {
    // Don't propagate props only used for setting up dispatch and computed props
    ...omit(ownProps, [
      "id",
      "cellFocused",
      "contentRef",
      "options",
      "channels",
      "kernelStatus"
    ]),
    // Merge in our _one_ configurable options dealy
    // Ideally this would be Immutable or remain consistent so that
    // we're not thrashing updates and renders...
    options: Object.assign({}, ownProps.options, { cursorBlinkRate }),
    channels: kernel ? kernel.channels : null,
    kernelStatus: selectors.currentKernelStatus(state) || "not connected"
  };
}

const mapDispatchToProps = (dispatch, ownProps: Props) => {
  const { cellFocused, id, contentRef } = ownProps;

  return {
    onChange: (text: string) => {
      dispatch(actions.updateCellSource({ id, value: text, contentRef }));
    },

    onFocusChange(focused: boolean): void {
      if (focused) {
        dispatch(actions.focusCellEditor({ id, contentRef }));
        if (!cellFocused) {
          dispatch(actions.focusCell({ id, contentRef }));
        }
      }
    }
  };
};

// $FlowFixMe: react-redux typings
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorView);
